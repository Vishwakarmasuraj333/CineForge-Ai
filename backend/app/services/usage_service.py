from typing import List, Tuple

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.usage_record import UsageRecord
from app.providers.registry import provider_registry
from app.schemas.usage import CostEstimateResponse, UsageSummaryResponse


class UsageService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_summary(self, owner_id: str) -> UsageSummaryResponse:
        # Aggregate totals
        agg_query = select(
            func.count(UsageRecord.id),
            func.coalesce(func.sum(UsageRecord.units), 0.0),
            func.coalesce(func.sum(UsageRecord.estimated_amount), 0.0),
            func.coalesce(func.sum(UsageRecord.actual_amount), 0.0),
        ).where(UsageRecord.owner_id == owner_id)

        res = await self.db.execute(agg_query)
        total_gen, total_sec, total_est, total_act = res.one()

        # Fetch recent 10 records
        rec_query = (
            select(UsageRecord)
            .where(UsageRecord.owner_id == owner_id)
            .order_by(UsageRecord.recorded_at.desc())
            .limit(10)
        )
        rec_res = await self.db.execute(rec_query)
        records = list(rec_res.scalars().all())

        return UsageSummaryResponse(
            total_generations=total_gen,
            total_video_seconds=float(total_sec),
            total_estimated_cost=float(total_est),
            total_actual_cost=float(total_act),
            recent_records=records,
        )

    async def list_records(
        self, owner_id: str, skip: int = 0, limit: int = 50
    ) -> Tuple[List[UsageRecord], int]:
        count_q = select(func.count(UsageRecord.id)).where(UsageRecord.owner_id == owner_id)
        total_res = await self.db.execute(count_q)
        total = total_res.scalar() or 0

        q = (
            select(UsageRecord)
            .where(UsageRecord.owner_id == owner_id)
            .order_by(UsageRecord.recorded_at.desc())
            .offset(skip)
            .limit(limit)
        )
        res = await self.db.execute(q)
        return list(res.scalars().all()), total

    def estimate(
        self, provider_name: str, model_id: str, duration_seconds: int, resolution: str
    ) -> CostEstimateResponse:
        provider = provider_registry.get_provider(provider_name)
        cost = provider.estimate_cost(model_id, duration_seconds, resolution)
        return CostEstimateResponse(
            provider_name=provider_name,
            model_id=model_id,
            duration_seconds=duration_seconds,
            resolution=resolution,
            estimated_cost=cost,
            currency="USD",
            pricing_source="provider_catalog",
            is_supported=True,
        )
