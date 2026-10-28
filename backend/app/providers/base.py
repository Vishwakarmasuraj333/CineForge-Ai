from abc import ABC, abstractmethod

from app.providers.schemas import (
    ProviderCapabilities,
    ProviderJobStatus,
    VideoGenerationRequest,
)


class BaseVideoProvider(ABC):
    """
    Abstract interface for all external AI video generation providers.
    Ensures CineForge core is decoupled from any vendor's proprietary API.
    """

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Unique provider identifier (e.g., 'replicate', 'fal', 'mock')."""
        pass

    @abstractmethod
    def get_capabilities(self) -> ProviderCapabilities:
        """Returns provider status, configuration health, and model registry."""
        pass

    @abstractmethod
    def validate_request(self, request: VideoGenerationRequest) -> None:
        """
        Validates model parameters (aspect ratio, duration, resolution, modes)
        against provider model capabilities.
        """
        pass

    @abstractmethod
    async def submit_generation(self, request: VideoGenerationRequest) -> ProviderJobStatus:
        """Submits video synthesis task to external provider and returns initial status."""
        pass

    @abstractmethod
    async def get_generation_status(self, provider_job_id: str) -> ProviderJobStatus:
        """Polls external provider job status."""
        pass

    @abstractmethod
    async def cancel_generation(self, provider_job_id: str) -> bool:
        """Cancels generation job if supported by provider."""
        pass

    @abstractmethod
    def estimate_cost(self, model_id: str, duration_seconds: int, resolution: str) -> float:
        """Calculates expected upfront cost in USD based on provider pricing catalog."""
        pass

    @abstractmethod
    async def download_output(self, output_video_url: str) -> bytes:
        """Securely streams and downloads video payload from provider."""
        pass
