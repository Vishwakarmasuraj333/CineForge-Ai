import asyncio

from app.workers.async_runner import process_generation_async
from app.workers.celery_app import celery


@celery.task(bind=True, max_retries=3, default_retry_delay=10)
def process_generation_task(self, generation_id: str):
    """
    Celery task wrapper for video generation job execution and status polling.
    """
    try:
        asyncio.run(process_generation_async(generation_id))
    except Exception as exc:
        raise self.retry(exc=exc)
