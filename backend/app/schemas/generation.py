from datetime import datetime
from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, ConfigDict, Field


class GenerationCreateRequest(BaseModel):
    project_id: str
    prompt: str = Field(..., min_length=3, max_length=2000)
    negative_prompt: Optional[str] = Field(None, max_length=1000)
    generation_type: Literal["text_to_video", "image_to_video"] = "text_to_video"
    provider_name: Optional[str] = None
    provider_model_id: Optional[str] = None
    input_asset_id: Optional[str] = None
    parameters: Optional[Dict[str, Any]] = Field(
        default_factory=lambda: {
            "aspect_ratio": "16:9",
            "duration_seconds": 5,
            "resolution": "720p",
            "fps": 24
        }
    )
    idempotency_key: Optional[str] = None


class GenerationRetryRequest(BaseModel):
    override_parameters: Optional[Dict[str, Any]] = None


class GenerationResponse(BaseModel):
    id: str
    project_id: str
    owner_id: str
    provider_name: str
    provider_model_id: str
    generation_type: str
    prompt: str
    negative_prompt: Optional[str]
    input_asset_id: Optional[str]
    parameters_json: Optional[Dict[str, Any]]
    status: str
    provider_job_id: Optional[str]
    progress_percent: Optional[int]
    idempotency_key: str
    estimated_cost: float
    actual_cost: Optional[float]
    error_code: Optional[str]
    safe_error_message: Optional[str]
    queued_at: datetime
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class GenerationListResponse(BaseModel):
    items: List[GenerationResponse]
    total: int
