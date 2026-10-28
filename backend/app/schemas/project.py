from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict, Field


class ProjectCreateRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    metadata_json: Optional[Dict[str, Any]] = None


class ProjectUpdateRequest(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    status: Optional[str] = Field(None, pattern="^(ACTIVE|ARCHIVED)$")
    metadata_json: Optional[Dict[str, Any]] = None


class ProjectResponse(BaseModel):
    id: str
    owner_id: str
    title: str
    description: Optional[str]
    status: str
    metadata_json: Optional[Dict[str, Any]]
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class ProjectListResponse(BaseModel):
    items: List[ProjectResponse]
    total: int
