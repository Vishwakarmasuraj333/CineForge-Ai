import uuid
from typing import List, Optional, Tuple

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AccessForbiddenException, EntityNotFoundException
from app.media.validation import calculate_sha256, sanitize_filename, validate_image_upload
from app.models.asset import Asset
from app.storage import get_storage


class AssetService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.storage = get_storage()

    async def upload_image(
        self,
        owner_id: str,
        content: bytes,
        original_filename: str,
        project_id: Optional[str] = None
    ) -> Asset:
        # Validate file
        clean_filename = sanitize_filename(original_filename)
        mime_type, width, height = validate_image_upload(content, clean_filename)
        checksum = calculate_sha256(content)

        # Generate unique storage key
        file_ext = clean_filename.split(".")[-1]
        storage_key = f"users/{owner_id}/images/{uuid.uuid4().hex}.{file_ext}"

        # Persist to storage driver
        await self.storage.save(content, storage_key, mime_type)

        # Save metadata record
        asset = Asset(
            owner_id=owner_id,
            project_id=project_id,
            asset_type="input_image",
            storage_key=storage_key,
            original_filename=clean_filename,
            mime_type=mime_type,
            file_size_bytes=len(content),
            checksum=checksum,
            width=width,
            height=height,
        )
        self.db.add(asset)
        await self.db.commit()
        await self.db.refresh(asset)
        return asset

    async def get_by_id(self, asset_id: str, owner_id: str) -> Asset:
        query = select(Asset).where(Asset.id == asset_id, Asset.deleted_at.is_(None))
        res = await self.db.execute(query)
        asset = res.scalar_one_or_none()

        if not asset:
            raise EntityNotFoundException("Asset", asset_id)

        if asset.owner_id != owner_id:
            raise AccessForbiddenException("You do not have access to this asset.")

        return asset

    async def list(
        self, owner_id: str, project_id: Optional[str] = None, skip: int = 0, limit: int = 50
    ) -> Tuple[List[Asset], int]:
        filters = [Asset.owner_id == owner_id, Asset.deleted_at.is_(None)]
        if project_id:
            filters.append(Asset.project_id == project_id)

        count_query = select(func.count(Asset.id)).where(*filters)
        total_res = await self.db.execute(count_query)
        total = total_res.scalar() or 0

        query = select(Asset).where(*filters).order_by(Asset.created_at.desc()).offset(skip).limit(limit)
        res = await self.db.execute(query)
        items = list(res.scalars().all())
        return items, total

    async def get_download_url(self, asset_id: str, owner_id: str) -> str:
        asset = await self.get_by_id(asset_id, owner_id)
        return await self.storage.get_download_url(asset.storage_key)
