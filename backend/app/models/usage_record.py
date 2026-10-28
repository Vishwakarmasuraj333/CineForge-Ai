import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class UsageRecord(Base):
    __tablename__ = "usage_records"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    owner_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    generation_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("generations.id", ondelete="SET NULL"), nullable=True, index=True)

    provider_name: Mapped[str] = mapped_column(String(50), nullable=False)
    model_id: Mapped[str] = mapped_column(String(100), nullable=False)
    usage_type: Mapped[str] = mapped_column(String(50), default="video_seconds", nullable=False)
    units: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    estimated_amount: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    actual_amount: Mapped[float | None] = mapped_column(Float, nullable=True)
    currency: Mapped[str] = mapped_column(String(10), default="USD", nullable=False)
    pricing_source: Mapped[str] = mapped_column(String(100), default="provider_catalog", nullable=False)

    recorded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    generation = relationship("Generation", back_populates="usage_records")
