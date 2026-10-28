from typing import Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.generation import (
    GenerationCreateRequest,
    GenerationListResponse,
    GenerationResponse,
)
from app.services.generation_service import GenerationService
from app.workers.async_runner import enqueue_generation_job

router = APIRouter(prefix="/generations", tags=["Video Generations"])


@router.post("", response_model=GenerationResponse, status_code=status.HTTP_201_CREATED)
async def create_generation(
    req: GenerationCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = GenerationService(db)
    gen, is_new = await service.create_generation(current_user.id, req)

    if is_new:
        # Enqueue background execution asynchronously
        enqueue_generation_job(gen.id)

    return gen


@router.get("", response_model=GenerationListResponse)
async def list_generations(
    project_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = GenerationService(db)
    items, total = await service.list(current_user.id, project_id, status, skip, limit)
    return GenerationListResponse(items=items, total=total)


@router.get("/{generation_id}", response_model=GenerationResponse)
async def get_generation(
    generation_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = GenerationService(db)
    return await service.get_by_id(generation_id, current_user.id)


@router.post("/{generation_id}/cancel", response_model=GenerationResponse)
async def cancel_generation(
    generation_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = GenerationService(db)
    return await service.cancel(generation_id, current_user.id)
