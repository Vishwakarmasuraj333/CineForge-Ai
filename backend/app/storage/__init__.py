from app.core.config import settings
from app.storage.base import BaseStorage
from app.storage.local import LocalStorage

_storage_instance: BaseStorage | None = None


def get_storage() -> BaseStorage:
    global _storage_instance
    if _storage_instance is None:
        if settings.STORAGE_BACKEND == "s3" and settings.S3_ACCESS_KEY_ID:
            from app.storage.object_storage import S3Storage
            _storage_instance = S3Storage()
        else:
            _storage_instance = LocalStorage()
    return _storage_instance
