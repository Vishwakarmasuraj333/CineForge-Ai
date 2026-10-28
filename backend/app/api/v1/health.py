from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.storage import get_storage

router = APIRouter(tags=["System Health"])


@router.get("/health/live")
async def health_live():
    return {"status": "LIVE", "timestamp": "ok"}


@router.get("/health/ready")
async def health_ready(db: AsyncSession = Depends(get_db)):
    # Test DB
    try:
        await db.execute(text("SELECT 1"))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Database unreachable: {str(e)}"
        )

    # Test storage
    try:
        get_storage()
        # Verify base dir / connection
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Storage driver unreachable: {str(e)}"
        )

    return {"status": "READY", "database": "CONNECTED", "storage": "HEALTHY"}
