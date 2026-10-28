from celery import Celery

from app.core.config import settings

celery = Celery(
    "cineforge_tasks",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

celery.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_always_eager=settings.CELERY_TASK_ALWAYS_EAGER,
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    task_time_limit=settings.MAX_GENERATION_TIMEOUT_SECONDS + 60,
)

celery.autodiscover_tasks(["app.workers.generation_tasks"])
