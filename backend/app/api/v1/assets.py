from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.asset import AssetListResponse, AssetResponse
from app.services.asset_service import AssetService
from app.storage import get_storage

router = APIRouter(prefix="/assets", tags=["Media Assets"])


@router.post("/upload", response_model=AssetResponse, status_code=status.HTTP_201_CREATED)
async def upload_asset(
    file: UploadFile = File(...),
    project_id: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    content = await file.read()
    service = AssetService(db)
    asset = await service.upload_image(
        owner_id=current_user.id,
        content=content,
        original_filename=file.filename or "image.png",
        project_id=project_id,
    )
    download_url = await service.get_download_url(asset.id, current_user.id)
    resp = AssetResponse.model_validate(asset)
    resp.download_url = download_url
    return resp


@router.get("", response_model=AssetListResponse)
async def list_assets(
    project_id: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = AssetService(db)
    items, total = await service.list(current_user.id, project_id, skip, limit)
    res_items = []
    for item in items:
        resp = AssetResponse.model_validate(item)
        resp.download_url = await service.get_download_url(item.id, current_user.id)
        res_items.append(resp)
    return AssetListResponse(items=res_items, total=total)


@router.get("/{asset_id}", response_model=AssetResponse)
async def get_asset(
    asset_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = AssetService(db)
    asset = await service.get_by_id(asset_id, current_user.id)
    resp = AssetResponse.model_validate(asset)
    resp.download_url = await service.get_download_url(asset.id, current_user.id)
    return resp


@router.get("/{asset_id}/download")
async def download_asset(
    asset_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = AssetService(db)
    url = await service.get_download_url(asset_id, current_user.id)
    return {"download_url": url}


@router.get("/raw/{storage_key:path}")
async def serve_raw_asset(storage_key: str):
    """Secure endpoint for streaming stored local media directly to authenticated UI or download."""
    storage = get_storage()
    if not await storage.exists(storage_key):
        raise HTTPException(status_code=404, detail="Asset not found.")
    stream = await storage.get_stream(storage_key)
    mime = "video/mp4" if storage_key.endswith(".mp4") else "image/jpeg"
    return StreamingResponse(stream, media_type=mime)
