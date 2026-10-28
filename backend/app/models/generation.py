import uuid
from datetime import datetime, timezone

from sqlalchemy import JSON, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class Generation(Base):
    __tablename__ = "generations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    owner_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    provider_name: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    provider_model_id: Mapped[str] = mapped_column(String(100), nullable=False)
    generation_type: Mapped[str] = mapped_column(String(30), nullable=False)  # text_to_video, image_to_video

    prompt: Mapped[str] = mapped_column(Text, nullable=False)
    negative_prompt: Mapped[str | None] = mapped_column(Text, nullable=True)
    input_asset_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    parameters_json: Mapped[dict | None] = mapped_column(JSON, default=dict, nullable=True)

    # Status machine: QUEUED -> SUBMITTED -> PROCESSING -> DOWNLOADING -> SUCCEEDED | FAILED | CANCELLED
    status: Mapped[str] = mapped_column(String(30), default="QUEUED", index=True, nullable=False)
    provider_job_id: Mapped[str | None] = mapped_column(String(255), index=True, nullable=True)
    progress_percent: Mapped[int | None] = mapped_column(Integer, default=0, nullable=True)
    idempotency_key: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)

    estimated_cost: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    actual_cost: Mapped[float | None] = mapped_column(Float, nullable=True)

    error_code: Mapped[str | None] = mapped_column(String(50), nullable=True)
    safe_error_message: Mapped[str | None] = mapped_column(Text, nullable=True)

    queued_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relationships
    project = relationship("Project", back_populates="generations")
    owner = relationship("User", back_populates="generations")
    assets = relationship("Asset", back_populates="generation", cascade="all, delete-orphan")
    usage_records = relationship("UsageRecord", back_populates="generation", cascade="all, delete-orphan")
