import asyncio
import sys
from datetime import datetime, timezone
from pathlib import Path

# Add backend directory to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

from app.core.security import hash_password
from app.db.session import AsyncSessionLocal
from app.models.asset import Asset
from app.models.generation import Generation
from app.models.project import Project
from app.models.usage_record import UsageRecord
from app.models.user import User
from app.storage import get_storage
from app.providers.adapters.mock_provider import SAMPLE_MOCK_MP4_HEADER
from sqlalchemy import select


async def seed():
    print("Seeding initial development database...")
    async with AsyncSessionLocal() as db:
        storage = get_storage()

        # 1. Create or retrieve Creator Demo User
        user_res = await db.execute(select(User).where(User.email == "creator@cineforge.ai"))
        creator = user_res.scalar_one_or_none()
        if not creator:
            creator = User(
                email="creator@cineforge.ai",
                password_hash=hash_password("CinemaStudio2026!"),
                display_name="Christopher Nolan",
                role="USER",
                is_active=True,
            )
            db.add(creator)
            await db.flush()
            print("[+] Created Demo User: creator@cineforge.ai (Password: CinemaStudio2026!)")

        # 2. Create or retrieve Admin User
        admin_res = await db.execute(select(User).where(User.email == "admin@cineforge.ai"))
        admin = admin_res.scalar_one_or_none()
        if not admin:
            admin = User(
                email="admin@cineforge.ai",
                password_hash=hash_password("AdminMaster2026!"),
                display_name="System Administrator",
                role="ADMIN",
                is_active=True,
            )
            db.add(admin)
            await db.flush()
            print("[+] Created Admin User: admin@cineforge.ai (Password: AdminMaster2026!)")

        # 3. Create Sample Projects
        p1_res = await db.execute(select(Project).where(Project.title == "Neo-Kyoto Chronicles", Project.owner_id == creator.id))
        if not p1_res.scalar_one_or_none():
            p1 = Project(
                owner_id=creator.id,
                title="Neo-Kyoto Chronicles",
                description="Cyberpunk motion teaser exploring vertical megastructures and rain-slicked neon alleys.",
                status="ACTIVE",
            )
            db.add(p1)
            await db.flush()

            # Seed a sample completed video generation
            gen1 = Generation(
                project_id=p1.id,
                owner_id=creator.id,
                provider_name="mock",
                provider_model_id="cineforge-mock-v1",
                generation_type="text_to_video",
                prompt="Rain-slicked neon street in Neo-Kyoto with reflections of flying vehicles, slow cinematic tracking shot, 8k",
                parameters_json={"aspect_ratio": "16:9", "duration_seconds": 5, "resolution": "720p"},
                status="SUCCEEDED",
                provider_job_id="mock_job_seed_001",
                progress_percent=100,
                idempotency_key="seed_idempotency_001",
                estimated_cost=0.05,
                actual_cost=0.05,
                completed_at=datetime.now(timezone.utc),
            )
            db.add(gen1)
            await db.flush()

            # Save sample video asset
            video_key = f"users/{creator.id}/videos/{gen1.id}.mp4"
            await storage.save(SAMPLE_MOCK_MP4_HEADER, video_key, "video/mp4")

            asset = Asset(
                owner_id=creator.id,
                project_id=p1.id,
                generation_id=gen1.id,
                asset_type="generated_video",
                storage_key=video_key,
                original_filename=f"{gen1.id}.mp4",
                mime_type="video/mp4",
                file_size_bytes=len(SAMPLE_MOCK_MP4_HEADER),
                checksum="sample_seed_checksum_hash",
                duration_seconds=5.0,
            )
            db.add(asset)

            # Record usage
            usage = UsageRecord(
                owner_id=creator.id,
                generation_id=gen1.id,
                provider_name="mock",
                model_id="cineforge-mock-v1",
                usage_type="video_seconds",
                units=5.0,
                estimated_amount=0.05,
                actual_amount=0.05,
                currency="USD",
                pricing_source="provider_catalog",
            )
            db.add(usage)
            print("[+] Seeded Sample Project & Succeeded Generation with Video Asset.")

        await db.commit()
        print("Database seeding completed successfully!")


if __name__ == "__main__":
    asyncio.run(seed())
