from typing import Dict

from app.core.exceptions import ValidationException
from app.providers.base import BaseVideoProvider
from app.providers.schemas import (
    ProviderCapabilities,
    ProviderJobStatus,
    ProviderModelSpec,
    VideoGenerationRequest,
)

# Minimal 1-second valid MP4 container bytes for test mock downloads
SAMPLE_MOCK_MP4_HEADER = (
    b"\x00\x00\x00\x18ftypmp42\x00\x00\x00\x00isommp42\x00\x00\x00\x08free"
    b"\x00\x00\x00\x28mdat\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00"
    b"\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00"
)


class MockVideoProvider(BaseVideoProvider):
    """
    Mock Video Provider for deterministic offline testing, CI pipelines,
    and zero-credit local development.
    """

    def __init__(self):
        self._jobs: Dict[str, ProviderJobStatus] = {}
        self._polls: Dict[str, int] = {}

    @property
    def provider_name(self) -> str:
        return "mock"

    def get_capabilities(self) -> ProviderCapabilities:
        return ProviderCapabilities(
            provider_name="mock",
            is_available=True,
            requires_api_key=False,
            is_configured=True,
            models=[
                ProviderModelSpec(
                    model_id="cineforge-mock-v1",
                    display_name="CineForge Synthetic Fast (Test)",
                    supports_text_to_video=True,
                    supports_image_to_video=True,
                    supported_aspect_ratios=["16:9", "9:16", "1:1"],
                    supported_durations_seconds=[5, 10],
                    supported_resolutions=["720p", "1080p"],
                    supports_negative_prompt=True,
                    supports_seed=True,
                    cost_per_second_usd=0.01,
                ),
                ProviderModelSpec(
                    model_id="cineforge-mock-pro",
                    display_name="CineForge Cinematic High-Fi (Test)",
                    supports_text_to_video=True,
                    supports_image_to_video=True,
                    supported_aspect_ratios=["16:9", "9:16", "2.39:1"],
                    supported_durations_seconds=[5, 10],
                    supported_resolutions=["1080p", "4k"],
                    supports_negative_prompt=True,
                    supports_seed=True,
                    cost_per_second_usd=0.04,
                ),
            ],
        )

    def validate_request(self, request: VideoGenerationRequest) -> None:
        capabilities = self.get_capabilities()
        model_map = {m.model_id: m for m in capabilities.models}

        if request.model_id not in model_map:
            raise ValidationException(f"Unsupported mock model '{request.model_id}'.")

        spec = model_map[request.model_id]
        if request.aspect_ratio not in spec.supported_aspect_ratios:
            raise ValidationException(
                f"Aspect ratio '{request.aspect_ratio}' is not supported by {spec.display_name}."
            )

        if request.generation_type == "image_to_video" and not spec.supports_image_to_video:
            raise ValidationException(f"Model {spec.display_name} does not support image-to-video.")

    async def submit_generation(self, request: VideoGenerationRequest) -> ProviderJobStatus:
        self.validate_request(request)
        job_id = f"mock_job_{request.generation_id}"

        status = ProviderJobStatus(
            provider_job_id=job_id,
            status="SUBMITTED",
            progress_percent=10,
            output_video_url=None,
        )
        self._jobs[job_id] = status
        self._polls[job_id] = 0
        return status

    async def get_generation_status(self, provider_job_id: str) -> ProviderJobStatus:
        if provider_job_id not in self._jobs:
            return ProviderJobStatus(
                provider_job_id=provider_job_id,
                status="FAILED",
                error_code="JOB_NOT_FOUND",
                error_message="Job was not found in mock queue."
            )

        polls = self._polls.get(provider_job_id, 0) + 1
        self._polls[provider_job_id] = polls

        if polls == 1:
            status = ProviderJobStatus(
                provider_job_id=provider_job_id,
                status="PROCESSING",
                progress_percent=50,
            )
        else:
            status = ProviderJobStatus(
                provider_job_id=provider_job_id,
                status="SUCCEEDED",
                progress_percent=100,
                output_video_url=f"mock://outputs/{provider_job_id}.mp4"
            )

        self._jobs[provider_job_id] = status
        return status

    async def cancel_generation(self, provider_job_id: str) -> bool:
        if provider_job_id in self._jobs:
            self._jobs[provider_job_id] = ProviderJobStatus(
                provider_job_id=provider_job_id,
                status="CANCELLED",
                progress_percent=0,
            )
            return True
        return False

    def estimate_cost(self, model_id: str, duration_seconds: int, resolution: str) -> float:
        rate = 0.04 if "pro" in model_id else 0.01
        return round(rate * duration_seconds, 3)

    async def download_output(self, output_video_url: str) -> bytes:
        # Return valid test video fixture bytes
        return SAMPLE_MOCK_MP4_HEADER
