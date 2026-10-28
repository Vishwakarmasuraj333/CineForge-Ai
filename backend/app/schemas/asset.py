from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict


class AssetResponse(BaseModel):
    id: str
    owner_id: str
    project_id: Optional[str]
    generation_id: Optional[str]
    asset_type: str
    storage_key: str
    original_filename: str
    mime_type: str
    file_size_bytes: int
    checksum: str
    width: Optional[int]
    height: Optional[int]
    duration_seconds: Optional[float]
    download_url: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AssetListResponse(BaseModel):
    items: List[AssetResponse]
    total: int
