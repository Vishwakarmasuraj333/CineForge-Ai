from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import require_admin
from app.db.session import get_db
from app.models.audit_log import AuditLog
from app.models.generation import Generation
from app.models.user import User

router = APIRouter(prefix="/admin", tags=["Administration"], dependencies=[Depends(require_admin)])


@router.get("/overview")
async def get_admin_overview(db: AsyncSession = Depends(get_db)):
    users_count = (await db.execute(select(func.count(User.id)))).scalar() or 0
    generations_count = (await db.execute(select(func.count(Generation.id)))).scalar() or 0
    total_cost = (await db.execute(select(func.coalesce(func.sum(Generation.actual_cost), 0.0)))).scalar() or 0.0

    return {
        "total_users": users_count,
        "total_generations": generations_count,
        "total_billed_usd": float(total_cost),
        "system_status": "HEALTHY",
    }


@router.get("/users")
async def list_admin_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(select(User).order_by(User.created_at.desc()).offset(skip).limit(limit))
    users = res.scalars().all()
    return [{"id": u.id, "email": u.email, "display_name": u.display_name, "role": u.role, "is_active": u.is_active, "created_at": u.created_at} for u in users]


@router.get("/generations")
async def list_admin_generations(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(select(Generation).order_by(Generation.created_at.desc()).offset(skip).limit(limit))
    return res.scalars().all()


@router.get("/audit-logs")
async def list_admin_audit_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(select(AuditLog).order_by(AuditLog.created_at.desc()).offset(skip).limit(limit))
    return res.scalars().all()

