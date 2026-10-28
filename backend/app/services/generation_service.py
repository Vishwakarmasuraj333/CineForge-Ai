import base64
import uuid
from datetime import datetime, timezone
from typing import List, Optional, Tuple

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.exceptions import (
    AccessForbiddenException,
    EntityNotFoundException,
    ValidationException,
)
from app.media.validation import calculate_sha256
from app.models.asset import Asset
from app.models.generation import Generation
from app.models.project import Project
from app.models.usage_record import UsageRecord
from app.providers.registry import provider_registry
from app.providers.schemas import VideoGenerationRequest
from app.schemas.generation import GenerationCreateRequest
from app.storage import get_storage


class GenerationService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.storage = get_storage()

    async def create_generation(
        self, owner_id: str, req: GenerationCreateRequest
    ) -> Tuple[Generation, bool]:
        """
        Creates a generation task with idempotency protection.
        Returns: (generation, is_newly_created)
        """
        # Validate project ownership
        proj_res = await self.db.execute(
            select(Project).where(
                Project.id == req.project_id,
                Project.owner_id == owner_id,
                Project.deleted_at.is_(None)
            )
        )
        project = proj_res.scalar_one_or_none()
        if not project:
            raise EntityNotFoundException("Project", req.project_id)

        # Explicit client-generated idempotency key or fresh UUID per generation
        if req.idempotency_key:
            idempotency_key = req.idempotency_key.strip()
            existing_res = await self.db.execute(
                select(Generation).where(Generation.idempotency_key == idempotency_key)
            )
            existing = existing_res.scalar_one_or_none()
            if existing:
                # Check for parameter conflict
                if (
                    existing.owner_id != owner_id
                    or existing.project_id != req.project_id
                    or existing.prompt != req.prompt.strip()
                ):
                    raise ValidationException(
                        "Idempotency key has already been used with different request parameters.",
                        details={"idempotency_key": idempotency_key}
                    )
                # Safe idempotent return of existing generation record
                return existing, False
        else:
            idempotency_key = f"gen_{uuid.uuid4().hex}"

        # Select provider and model
        provider_name = req.provider_name or settings.DEFAULT_VIDEO_PROVIDER
        provider = provider_registry.get_provider(provider_name)

        params = req.parameters or {}
        duration = params.get("duration_seconds", 5)
        resolution = params.get("resolution", "720p")

        # Determine default model if not supplied
        caps = provider.get_capabilities()
        model_id = req.provider_model_id or (caps.models[0].model_id if caps.models else "default")

        # Estimate cost upfront
        estimated_cost = provider.estimate_cost(model_id, duration, resolution)

        generation = Generation(
            project_id=req.project_id,
            owner_id=owner_id,
            provider_name=provider_name,
            provider_model_id=model_id,
            generation_type=req.generation_type,
            prompt=req.prompt.strip(),
            negative_prompt=req.negative_prompt.strip() if req.negative_prompt else None,
            input_asset_id=req.input_asset_id,
            parameters_json=params,
            status="QUEUED",
            progress_percent=0,
            idempotency_key=idempotency_key,
            estimated_cost=estimated_cost,
        )
        self.db.add(generation)
        await self.db.commit()
        await self.db.refresh(generation)

        return generation, True

    async def get_by_id(self, generation_id: str, owner_id: str) -> Generation:
        query = select(Generation).where(Generation.id == generation_id)
        res = await self.db.execute(query)
        gen = res.scalar_one_or_none()

        if not gen:
            raise EntityNotFoundException("Generation", generation_id)
        if gen.owner_id != owner_id:
            raise AccessForbiddenException("You do not have permission to view this generation.")

        return gen

    async def list(
        self,
        owner_id: str,
        project_id: Optional[str] = None,
        status: Optional[str] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> Tuple[List[Generation], int]:
        filters = [Generation.owner_id == owner_id]
        if project_id:
            filters.append(Generation.project_id == project_id)
        if status:
            filters.append(Generation.status == status)

        count_query = select(func.count(Generation.id)).where(*filters)
        total_res = await self.db.execute(count_query)
        total = total_res.scalar() or 0

        query = (
            select(Generation)
            .where(*filters)
            .order_by(Generation.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        res = await self.db.execute(query)
        items = list(res.scalars().all())
        return items, total

    async def execute_generation_step(self, generation_id: str) -> Generation:
        """
        Executes a processing step for the generation (called by worker or async runner).
        """
        res = await self.db.execute(select(Generation).where(Generation.id == generation_id))
        gen = res.scalar_one_or_none()
        if not gen:
            raise EntityNotFoundException("Generation", generation_id)

        provider = provider_registry.get_provider(gen.provider_name)
        now = datetime.now(timezone.utc)

        if gen.status == "QUEUED":
            # Submit to provider
            params = gen.parameters_json or {}
            input_url = None
            if gen.input_asset_id:
                asset_res = await self.db.execute(
                    select(Asset).where(Asset.id == gen.input_asset_id)
                )
                asset = asset_res.scalar_one_or_none()
                if asset:
                    if getattr(self.storage, "backend_type", "local") == "local":
                        # Convert local asset to base64 Data URI for cloud provider compatibility
                        file_bytes = await self.storage.get_bytes(asset.storage_key)
                        mime = asset.mime_type or "image/jpeg"
                        b64 = base64.b64encode(file_bytes).decode("utf-8")
                        input_url = f"data:{mime};base64,{b64}"
                    else:
                        input_url = await self.storage.get_download_url(asset.storage_key)

            req = VideoGenerationRequest(
                generation_id=gen.id,
                prompt=gen.prompt,
                negative_prompt=gen.negative_prompt,
                generation_type=gen.generation_type,
                model_id=gen.provider_model_id,
                aspect_ratio=params.get("aspect_ratio", "16:9"),
                duration_seconds=params.get("duration_seconds", 5),
                resolution=params.get("resolution", "720p"),
                fps=params.get("fps", 24),
                seed=params.get("seed"),
                input_image_url=input_url,
            )

            job_status = await provider.submit_generation(req)
            gen.provider_job_id = job_status.provider_job_id
            gen.status = job_status.status
            gen.progress_percent = job_status.progress_percent or 10
            gen.started_at = now
            await self.db.commit()
            return gen

        elif gen.status in ["SUBMITTED", "PROCESSING"]:
            if not gen.provider_job_id:
                gen.status = "FAILED"
                gen.safe_error_message = "Missing provider job identifier."
                await self.db.commit()
                return gen

            job_status = await provider.get_generation_status(gen.provider_job_id)
            gen.progress_percent = job_status.progress_percent or gen.progress_percent

            if job_status.status == "SUCCEEDED" and job_status.output_video_url:
                gen.status = "DOWNLOADING"
                await self.db.commit()

                # Download video payload
                video_bytes = await provider.download_output(job_status.output_video_url)
                storage_key = f"users/{gen.owner_id}/videos/{gen.id}.mp4"
                await self.storage.save(video_bytes, storage_key, "video/mp4")

                # Create video asset record
                asset = Asset(
                    owner_id=gen.owner_id,
                    project_id=gen.project_id,
                    generation_id=gen.id,
                    asset_type="generated_video",
                    storage_key=storage_key,
                    original_filename=f"{gen.id}.mp4",
                    mime_type="video/mp4",
                    file_size_bytes=len(video_bytes),
                    checksum=calculate_sha256(video_bytes),
                    duration_seconds=float((gen.parameters_json or {}).get("duration_seconds", 5)),
                )
                self.db.add(asset)

                # Record usage ledger
                duration_sec = float((gen.parameters_json or {}).get("duration_seconds", 5))
                usage = UsageRecord(
                    owner_id=gen.owner_id,
                    generation_id=gen.id,
                    provider_name=gen.provider_name,
                    model_id=gen.provider_model_id,
                    usage_type="video_seconds",
                    units=duration_sec,
                    estimated_amount=gen.estimated_cost,
                    actual_amount=gen.estimated_cost,
                    currency="USD",
                    pricing_source="provider_catalog",
                )
                self.db.add(usage)

                gen.status = "SUCCEEDED"
                gen.actual_cost = gen.estimated_cost
                gen.progress_percent = 100
                gen.completed_at = datetime.now(timezone.utc)
                await self.db.commit()
                return gen

            elif job_status.status == "FAILED":
                gen.status = "FAILED"
                gen.error_code = job_status.error_code or "PROVIDER_ERROR"
                gen.safe_error_message = job_status.error_message or "Video generation failed at provider."
                gen.completed_at = datetime.now(timezone.utc)
                await self.db.commit()
                return gen

            elif job_status.status == "CANCELLED":
                gen.status = "CANCELLED"
                gen.completed_at = datetime.now(timezone.utc)
                await self.db.commit()
                return gen
            else:
                gen.status = job_status.status
                await self.db.commit()
                return gen

        return gen

    async def cancel(self, generation_id: str, owner_id: str) -> Generation:
        gen = await self.get_by_id(generation_id, owner_id)
        if gen.status in ["SUCCEEDED", "FAILED", "CANCELLED"]:
            raise ValidationException(f"Cannot cancel generation in terminal state '{gen.status}'.")

        provider = provider_registry.get_provider(gen.provider_name)
        if gen.provider_job_id:
            await provider.cancel_generation(gen.provider_job_id)

        gen.status = "CANCELLED"
        gen.completed_at = datetime.now(timezone.utc)
        await self.db.commit()
        await self.db.refresh(gen)
        return gen
