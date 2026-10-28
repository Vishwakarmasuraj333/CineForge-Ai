import asyncio

from sqlalchemy import select

from app.core.logging import logger
from app.db.session import AsyncSessionLocal
from app.models.generation import Generation
from app.services.generation_service import GenerationService


async def process_generation_async(generation_id: str):
    """
    Background worker loop for generation jobs.
    Runs asynchronously without blocking HTTP requests.
    """
    logger.info(f"Background worker picked up generation {generation_id}")
    max_polls = 120  # Max 10 minutes at 5s intervals
    poll_count = 0

    while poll_count < max_polls:
        async with AsyncSessionLocal() as db:
            service = GenerationService(db)
            try:
                gen = await service.execute_generation_step(generation_id)
                logger.info(f"Generation {generation_id} step executed. Status: {gen.status}, Progress: {gen.progress_percent}%")

                if gen.status in ["SUCCEEDED", "FAILED", "CANCELLED"]:
                    logger.info(f"Generation {generation_id} reached terminal state: {gen.status}")
                    break
            except Exception as e:
                logger.error(f"Error during generation {generation_id} step: {e}", exc_info=True)
                break

        poll_count += 1
        await asyncio.sleep(5)  # Polling interval with jitter can be added


def enqueue_generation_job(generation_id: str):
    """
    Dispatches generation job to background execution.
    If Redis is running, can dispatch via Celery; otherwise dispatches to asyncio event loop.
    """
    try:
        loop = asyncio.get_running_loop()
        loop.create_task(process_generation_async(generation_id))
        logger.info(f"Enqueued generation {generation_id} to asyncio background task.")
    except RuntimeError:
        # Fallback when running outside active loop
        asyncio.run(process_generation_async(generation_id))


async def recover_interrupted_jobs():
    """
    On application startup, scans the database for non-terminal generations
    (QUEUED, SUBMITTED, PROCESSING, DOWNLOADING) that were interrupted by a restart,
    and resumes processing them. Returns the list of resumed generations.
    """
    try:
        async with AsyncSessionLocal() as db:
            res = await db.execute(
                select(Generation).where(
                    Generation.status.in_(["QUEUED", "SUBMITTED", "PROCESSING", "DOWNLOADING"])
                )
            )
            interrupted = res.scalars().all()
            if interrupted:
                logger.info(f"Worker recovery found {len(interrupted)} interrupted generation job(s). Resuming...")
                for gen in interrupted:
                    enqueue_generation_job(gen.id)
            return interrupted
    except Exception as e:
        logger.warning(f"Error during interrupted jobs recovery: {e}")
        return []
