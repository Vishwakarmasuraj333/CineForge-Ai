from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel


class ProviderModelSpec(BaseModel):
    model_id: str
    display_name: str
    supports_text_to_video: bool = True
    supports_image_to_video: bool = False
    supported_aspect_ratios: List[str] = ["16:9", "9:16", "1:1"]
    supported_durations_seconds: List[int] = [5, 10]
    supported_resolutions: List[str] = ["720p", "1080p"]
    supports_negative_prompt: bool = False
    supports_seed: bool = False
    cost_per_second_usd: float = 0.05


class ProviderCapabilities(BaseModel):
    provider_name: str
    is_available: bool = True
    requires_api_key: bool = True
    is_configured: bool = False
    models: List[ProviderModelSpec] = []


class VideoGenerationRequest(BaseModel):
    generation_id: str
    prompt: str
    negative_prompt: Optional[str] = None
    generation_type: Literal["text_to_video", "image_to_video"] = "text_to_video"
    model_id: str
    aspect_ratio: str = "16:9"
    duration_seconds: int = 5
    resolution: str = "720p"
    fps: int = 24
    seed: Optional[int] = None
    input_image_url: Optional[str] = None
    extra_parameters: Optional[Dict[str, Any]] = None


class ProviderJobStatus(BaseModel):
    provider_job_id: str
    status: Literal["QUEUED", "SUBMITTED", "PROCESSING", "DOWNLOADING", "SUCCEEDED", "FAILED", "CANCELLED"]
    progress_percent: Optional[int] = None
    output_video_url: Optional[str] = None
    error_code: Optional[str] = None
    error_message: Optional[str] = None
    raw_response: Optional[Dict[str, Any]] = None
