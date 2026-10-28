from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


class CostEstimateRequest(BaseModel):
    provider_name: str
    model_id: str
    duration_seconds: int = Field(5, ge=1, le=60)
    resolution: str = "720p"


class CostEstimateResponse(BaseModel):
    provider_name: str
    model_id: str
    duration_seconds: int
    resolution: str
    estimated_cost: float
    currency: str = "USD"
    pricing_source: str
    is_supported: bool = True
    disclaimer: str = "This amount is an estimate based on provider catalog pricing."


class UsageRecordResponse(BaseModel):
    id: str
    owner_id: str
    generation_id: Optional[str]
    provider_name: str
    model_id: str
    usage_type: str
    units: float
    estimated_amount: float
    actual_amount: Optional[float]
    currency: str
    pricing_source: str
    recorded_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UsageSummaryResponse(BaseModel):
    total_generations: int
    total_video_seconds: float
    total_estimated_cost: float
    total_actual_cost: float
    currency: str = "USD"
    recent_records: List[UsageRecordResponse]
