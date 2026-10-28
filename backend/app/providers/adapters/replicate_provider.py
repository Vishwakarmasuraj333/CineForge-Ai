from typing import Dict, Optional

import httpx

from app.core.config import settings
from app.core.exceptions import ValidationException
from app.providers.base import BaseVideoProvider
from app.providers.errors import ProviderAuthError, ProviderError, ProviderRateLimitError
from app.providers.schemas import (
    ProviderCapabilities,
    ProviderJobStatus,
    ProviderModelSpec,
    VideoGenerationRequest,
)

REPLICATE_API_BASE = "https://api.replicate.com/v1"


class ReplicateVideoProvider(BaseVideoProvider):
    """
    Production adapter for Replicate AI Video Generation API.
    Supports Minimax Video-01, Kling-v1, CogVideoX, and Stable Video Diffusion.
    """

    def __init__(self, api_token: Optional[str] = None):
        self.api_token = api_token or settings.REPLICATE_API_TOKEN

    @property
    def provider_name(self) -> str:
        return "replicate"

    def get_capabilities(self) -> ProviderCapabilities:
        is_configured = bool(self.api_token and len(self.api_token) > 5)
        return ProviderCapabilities(
            provider_name="replicate",
            is_available=True,
            requires_api_key=True,
            is_configured=is_configured,
            models=[
                ProviderModelSpec(
                    model_id="minimax-video-01",
                    display_name="Minimax Video-01 (High Motion)",
                    supports_text_to_video=True,
                    supports_image_to_video=True,
                    supported_aspect_ratios=["16:9", "9:16", "1:1"],
                    supported_durations_seconds=[5, 10],
                    supported_resolutions=["720p", "1080p"],
                    supports_negative_prompt=True,
                    supports_seed=True,
                    cost_per_second_usd=0.08,
                ),
                ProviderModelSpec(
                    model_id="kling-v1-standard",
                    display_name="Kling v1 Standard",
                    supports_text_to_video=True,
                    supports_image_to_video=True,
                    supported_aspect_ratios=["16:9", "9:16", "1:1"],
                    supported_durations_seconds=[5, 10],
                    supported_resolutions=["720p", "1080p"],
                    supports_negative_prompt=True,
                    supports_seed=True,
                    cost_per_second_usd=0.07,
                ),
                ProviderModelSpec(
                    model_id="cogvideox-5b",
                    display_name="CogVideoX 5B (Open Weights)",
                    supports_text_to_video=True,
                    supports_image_to_video=False,
                    supported_aspect_ratios=["16:9", "9:16"],
                    supported_durations_seconds=[5],
                    supported_resolutions=["720p"],
                    supports_negative_prompt=False,
                    supports_seed=True,
                    cost_per_second_usd=0.03,
                ),
            ],
        )

    def validate_request(self, request: VideoGenerationRequest) -> None:
        if not self.api_token:
            raise ValidationException(
                "Replicate API key is not configured. Set REPLICATE_API_TOKEN or select 'mock' provider."
            )

        caps = self.get_capabilities()
        model_map = {m.model_id: m for m in caps.models}
        if request.model_id not in model_map:
            raise ValidationException(f"Unsupported model '{request.model_id}' on Replicate.")

        spec = model_map[request.model_id]
        if request.aspect_ratio not in spec.supported_aspect_ratios:
            raise ValidationException(
                f"Aspect ratio '{request.aspect_ratio}' is not supported by {spec.display_name}."
            )
        if request.generation_type == "image_to_video" and not spec.supports_image_to_video:
            raise ValidationException(f"Model {spec.display_name} does not support image-to-video.")

    def _get_headers(self) -> Dict[str, str]:
        return {
            "Authorization": f"Bearer {self.api_token}",
            "Content-Type": "application/json",
            "User-Agent": "CineForge-AI/1.0.0",
        }

    async def submit_generation(self, request: VideoGenerationRequest) -> ProviderJobStatus:
        self.validate_request(request)

        is_kling = "kling" in request.model_id.lower()
        is_cogvideo = "cogvideo" in request.model_id.lower()

        input_payload: Dict[str, object] = {
            "prompt": request.prompt,
        }

        if is_kling:
            url = f"{REPLICATE_API_BASE}/models/kwaivgi/kling-v1.6-standard/predictions"
            input_payload["duration"] = request.duration_seconds
            if request.aspect_ratio:
                input_payload["aspect_ratio"] = request.aspect_ratio
            if request.negative_prompt:
                input_payload["negative_prompt"] = request.negative_prompt
            if request.input_image_url and request.generation_type == "image_to_video":
                input_payload["start_image"] = request.input_image_url
        elif is_cogvideo:
            url = f"{REPLICATE_API_BASE}/models/fofr/cogvideox-5b/predictions"
            if request.seed is not None:
                input_payload["seed"] = request.seed
        else:
            # Default: Minimax Video-01
            url = f"{REPLICATE_API_BASE}/models/minimax/video-01/predictions"
            input_payload["prompt_optimizer"] = True
            if request.input_image_url and request.generation_type == "image_to_video":
                input_payload["first_frame_image"] = request.input_image_url
            elif request.aspect_ratio:
                input_payload["aspect_ratio"] = request.aspect_ratio

        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                response = await client.post(
                    url,
                    headers=self._get_headers(),
                    json={"input": input_payload},
                )
                if response.status_code == 401:
                    raise ProviderAuthError("Invalid Replicate API token.", self.provider_name)
                elif response.status_code == 422:
                    raise ValidationException(f"Replicate API unprocessable parameters: {response.text}")
                elif response.status_code == 429:
                    raise ProviderRateLimitError("Replicate API rate limit or quota exceeded.", self.provider_name)
                elif response.status_code >= 500:
                    raise ProviderError(f"Replicate provider server error: HTTP {response.status_code}", self.provider_name, response.status_code)
                elif response.status_code >= 400:
                    raise ProviderError(
                        f"Replicate API error: {response.text}", self.provider_name, response.status_code
                    )

                data = response.json()
                job_id = data.get("id")
                status_raw = data.get("status", "starting")

                return ProviderJobStatus(
                    provider_job_id=job_id,
                    status="SUBMITTED" if status_raw in ["starting", "queued"] else "PROCESSING",
                    progress_percent=10,
                    raw_response=data,
                )
            except httpx.RequestError as e:
                raise ProviderError(f"Network error connecting to Replicate: {str(e)}", self.provider_name)

    async def get_generation_status(self, provider_job_id: str) -> ProviderJobStatus:
        url = f"{REPLICATE_API_BASE}/predictions/{provider_job_id}"
        async with httpx.AsyncClient(timeout=15.0) as client:
            try:
                response = await client.get(url, headers=self._get_headers())
                if response.status_code == 401:
                    raise ProviderAuthError("Invalid Replicate API token.", self.provider_name)
                if response.status_code >= 400:
                    raise ProviderError(f"Failed to fetch job: {response.text}", self.provider_name)

                data = response.json()
                raw_status = data.get("status")

                if raw_status in ["starting", "queued"]:
                    return ProviderJobStatus(
                        provider_job_id=provider_job_id,
                        status="SUBMITTED",
                        progress_percent=15,
                        raw_response=data,
                    )
                elif raw_status == "processing":
                    return ProviderJobStatus(
                        provider_job_id=provider_job_id,
                        status="PROCESSING",
                        progress_percent=50,
                        raw_response=data,
                    )
                elif raw_status == "succeeded":
                    output = data.get("output")
                    output_url = output if isinstance(output, str) else (output[0] if output else None)
                    return ProviderJobStatus(
                        provider_job_id=provider_job_id,
                        status="SUCCEEDED",
                        progress_percent=100,
                        output_video_url=output_url,
                        raw_response=data,
                    )
                elif raw_status == "canceled":
                    return ProviderJobStatus(
                        provider_job_id=provider_job_id,
                        status="CANCELLED",
                        progress_percent=0,
                        raw_response=data,
                    )
                else:  # failed
                    error_msg = data.get("error") or "Replicate job failed."
                    return ProviderJobStatus(
                        provider_job_id=provider_job_id,
                        status="FAILED",
                        error_code="PROVIDER_FAILED",
                        error_message=str(error_msg),
                        raw_response=data,
                    )
            except httpx.RequestError as e:
                raise ProviderError(f"Network error polling Replicate: {str(e)}", self.provider_name)

    async def cancel_generation(self, provider_job_id: str) -> bool:
        url = f"{REPLICATE_API_BASE}/predictions/{provider_job_id}/cancel"
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                res = await client.post(url, headers=self._get_headers())
                return res.status_code in [200, 202]
            except Exception:
                return False

    def estimate_cost(self, model_id: str, duration_seconds: int, resolution: str) -> float:
        rate = 0.08 if "minimax" in model_id else (0.07 if "kling" in model_id else 0.03)
        return round(rate * duration_seconds, 3)

    async def download_output(self, output_video_url: str) -> bytes:
        async with httpx.AsyncClient(timeout=120.0, follow_redirects=True) as client:
            res = await client.get(output_video_url)
            if res.status_code != 200:
                raise ProviderError(
                    f"Failed to download generated video output: HTTP {res.status_code}",
                    self.provider_name
                )
            return res.content
