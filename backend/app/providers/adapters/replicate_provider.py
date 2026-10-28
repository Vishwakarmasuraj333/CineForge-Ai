import base64
from typing import Dict, Optional

import httpx

from app.core.config import settings
from app.core.exceptions import ValidationException
from app.core.logging import logger
from app.providers.base import BaseVideoProvider
from app.providers.errors import (
    ProviderAuthError,
    ProviderError,
    ProviderInsufficientCreditError,
    ProviderRateLimitError,
)
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
    Supports Minimax Video-01, Kuaishou Kling v4.0, and CogVideoX 5B.
    """

    def __init__(self, api_token: Optional[str] = None):
        self.api_token = api_token if api_token is not None else settings.REPLICATE_API_TOKEN

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
                    display_name="Kuaishou Kling v4.0 / Standard (Cinematic)",
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
        # Also allow raw Replicate model IDs
        normalized_id = request.model_id.lower().replace("/", "-")
        if request.model_id not in model_map and normalized_id not in model_map:
            # Check for partial matches
            matched = False
            for m_id in model_map:
                if m_id in normalized_id or normalized_id in m_id:
                    matched = True
                    break
            if not matched:
                raise ValidationException(f"Unsupported model '{request.model_id}' on Replicate.")

        # Find spec
        spec = model_map.get(request.model_id) or model_map.get(normalized_id)
        if spec:
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

    async def upload_file_to_replicate(
        self, file_bytes: bytes, filename: str = "frame.jpg", mime_type: str = "image/jpeg"
    ) -> Optional[str]:
        """
        Uploads an image asset to Replicate's managed file storage (POST /v1/files).
        Returns a globally accessible URL reachable by Replicate models.
        """
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                files = {"content": (filename, file_bytes, mime_type)}
                res = await client.post(
                    f"{REPLICATE_API_BASE}/files",
                    headers={"Authorization": f"Bearer {self.api_token}"},
                    files=files,
                )
                if res.status_code == 201:
                    data = res.json()
                    uploaded_url = data.get("urls", {}).get("get")
                    logger.info(f"Uploaded asset to Replicate Files CDN: {uploaded_url}")
                    return uploaded_url
                else:
                    logger.warning(f"Replicate Files API returned status {res.status_code}: {res.text}")
                    return None
        except Exception as e:
            logger.warning(f"Failed to upload asset to Replicate files API: {e}")
            return None

    async def submit_generation(self, request: VideoGenerationRequest) -> ProviderJobStatus:
        self.validate_request(request)

        is_kling = "kling" in request.model_id.lower()
        is_cogvideo = "cogvideo" in request.model_id.lower()

        # Handle image conditioning for image-to-video
        image_url = request.input_image_url
        if image_url and image_url.startswith("data:"):
            # Extract binary and upload via Replicate Files API for direct CDN delivery
            try:
                header, b64data = image_url.split(",", 1)
                mime = header.split(";")[0].replace("data:", "") or "image/jpeg"
                img_bytes = base64.b64decode(b64data)
                ext = "png" if "png" in mime else "jpg"
                uploaded_cdn_url = await self.upload_file_to_replicate(
                    img_bytes, f"input_frame.{ext}", mime
                )
                if uploaded_cdn_url:
                    image_url = uploaded_cdn_url
            except Exception as e:
                logger.warning(f"Could not convert data URI to Replicate CDN file: {e}")

        input_payload: Dict[str, object] = {
            "prompt": request.prompt,
        }

        if is_kling:
            url = f"{REPLICATE_API_BASE}/models/kwaivgi/kling-v4.0/predictions"
            input_payload["duration"] = request.duration_seconds
            if request.resolution:
                input_payload["resolution"] = request.resolution
            if request.aspect_ratio and not image_url:
                input_payload["aspect_ratio"] = request.aspect_ratio
            if request.negative_prompt:
                input_payload["negative_prompt"] = request.negative_prompt
            if image_url and request.generation_type == "image_to_video":
                input_payload["start_image"] = image_url
        elif is_cogvideo:
            url = f"{REPLICATE_API_BASE}/models/fofr/cogvideox-5b/predictions"
            if request.seed is not None:
                input_payload["seed"] = request.seed
        else:
            # Default: Minimax Video-01
            url = f"{REPLICATE_API_BASE}/models/minimax/video-01/predictions"
            input_payload["prompt_optimizer"] = True
            if image_url and request.generation_type == "image_to_video":
                input_payload["first_frame_image"] = image_url
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
                elif response.status_code == 402:
                    raise ProviderInsufficientCreditError(
                        "Replicate account has insufficient credits. Please add billing credits at https://replicate.com/account/billing or use the Deterministic Mock Provider for free offline generation.",
                        self.provider_name,
                        402,
                    )
                elif response.status_code == 422:
                    raise ValidationException(f"Replicate API unprocessable parameters: {response.text}")
                elif response.status_code == 429:
                    raise ProviderRateLimitError("Replicate API rate limit or quota exceeded.", self.provider_name)
                elif response.status_code >= 500:
                    raise ProviderError(
                        f"Replicate provider server error: HTTP {response.status_code}",
                        self.provider_name,
                        response.status_code,
                    )
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
            except (ProviderAuthError, ProviderInsufficientCreditError, ProviderRateLimitError, ValidationException):
                raise
            except httpx.RequestError as e:
                raise ProviderError(f"Network error connecting to Replicate: {str(e)}", self.provider_name)

    async def get_generation_status(self, provider_job_id: str) -> ProviderJobStatus:
        url = f"{REPLICATE_API_BASE}/predictions/{provider_job_id}"
        async with httpx.AsyncClient(timeout=15.0) as client:
            try:
                response = await client.get(url, headers=self._get_headers())
                if response.status_code == 401:
                    raise ProviderAuthError("Invalid Replicate API token.", self.provider_name)
                if response.status_code == 402:
                    raise ProviderInsufficientCreditError(
                        "Replicate account has insufficient credits.", self.provider_name, 402
                    )
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
            except (ProviderAuthError, ProviderInsufficientCreditError):
                raise
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
        m = model_id.lower()
        if "kling-v4" in m:
            rate = 0.10
        elif "kling" in m:
            rate = 0.07
        elif "minimax" in m:
            rate = 0.08
        else:
            rate = 0.03
        return round(rate * duration_seconds, 3)

    async def download_output(self, output_video_url: str) -> bytes:
        async with httpx.AsyncClient(timeout=120.0, follow_redirects=True) as client:
            res = await client.get(output_video_url)
            if res.status_code != 200:
                raise ProviderError(
                    f"Failed to download generated video output: HTTP {res.status_code}",
                    self.provider_name,
                )
            return res.content
