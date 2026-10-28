from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.usage import (
    CostEstimateResponse,
    UsageSummaryResponse,
)
from app.services.usage_service import UsageService

router = APIRouter(prefix="/usage", tags=["Usage & Billing"])


@router.get("/summary", response_model=UsageSummaryResponse)
async def get_usage_summary(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = UsageService(db)
    return await service.get_summary(current_user.id)


@router.get("/records")
async def list_usage_records(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = UsageService(db)
    items, total = await service.list_records(current_user.id, skip, limit)
    return {"items": items, "total": total}


@router.get("/estimate", response_model=CostEstimateResponse)
async def get_cost_estimate(
    provider_name: str = Query("mock"),
    model_id: str = Query("cineforge-mock-v1"),
    duration_seconds: int = Query(5, ge=1, le=60),
    resolution: str = Query("720p"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = UsageService(db)
    return service.estimate(provider_name, model_id, duration_seconds, resolution)
