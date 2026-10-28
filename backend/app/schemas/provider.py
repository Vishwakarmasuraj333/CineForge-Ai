from typing import List

from pydantic import BaseModel


class ModelCapability(BaseModel):
    model_id: str
    display_name: str
    supports_text_to_video: bool = True
    supports_image_to_video: bool = False
    supported_aspect_ratios: List[str]
    supported_durations_seconds: List[int]
    supported_resolutions: List[str]
    supports_negative_prompt: bool = False
    supports_seed: bool = False
    cost_per_second_usd: float


class ProviderCapabilityResponse(BaseModel):
    provider_name: str
    is_available: bool
    requires_api_key: bool
    is_configured: bool
    models: List[ModelCapability]


class ProviderListResponse(BaseModel):
    providers: List[ProviderCapabilityResponse]
    default_provider: str
