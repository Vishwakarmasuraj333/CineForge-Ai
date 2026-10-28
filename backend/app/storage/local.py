from pathlib import Path
from typing import BinaryIO

from app.core.config import settings
from app.core.exceptions import EntityNotFoundException
from app.storage.base import BaseStorage


class LocalStorage(BaseStorage):
    """Local filesystem storage driver for development and test environments."""

    backend_type: str = "local"

    def __init__(self, base_dir: str = settings.LOCAL_STORAGE_DIR):
        self.base_dir = Path(base_dir).resolve()
        self.base_dir.mkdir(parents=True, exist_ok=True)

    def _resolve_path(self, storage_key: str) -> Path:
        # Prevent path traversal attacks
        safe_key = storage_key.lstrip("/\\")
        target_path = (self.base_dir / safe_key).resolve()
        if not str(target_path).startswith(str(self.base_dir)):
            raise ValueError("Path traversal attempt detected.")
        return target_path

    async def save(self, file_content: bytes, storage_key: str, mime_type: str) -> str:
        target_path = self._resolve_path(storage_key)
        target_path.parent.mkdir(parents=True, exist_ok=True)
        with open(target_path, "wb") as f:
            f.write(file_content)
        return storage_key

    async def get_stream(self, storage_key: str) -> BinaryIO:
        target_path = self._resolve_path(storage_key)
        if not target_path.exists():
            raise EntityNotFoundException("StorageAsset", storage_key)
        return open(target_path, "rb")

    async def get_bytes(self, storage_key: str) -> bytes:
        target_path = self._resolve_path(storage_key)
        if not target_path.exists():
            raise EntityNotFoundException("StorageAsset", storage_key)
        return target_path.read_bytes()

    async def get_download_url(self, storage_key: str, expires_in: int = 3600) -> str:
        # For local driver, route through secure download endpoint
        return f"{settings.BACKEND_URL}/api/v1/assets/raw/{storage_key}"

    async def delete(self, storage_key: str) -> bool:
        target_path = self._resolve_path(storage_key)
        if target_path.exists():
            target_path.unlink()
            return True
        return False

    async def exists(self, storage_key: str) -> bool:
        target_path = self._resolve_path(storage_key)
        return target_path.exists()
