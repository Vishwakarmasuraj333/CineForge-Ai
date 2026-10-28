from abc import ABC, abstractmethod
from typing import BinaryIO


class BaseStorage(ABC):
    """Abstract interface for asset storage drivers (Local filesystem, S3, etc.)"""

    @abstractmethod
    async def save(self, file_content: bytes, storage_key: str, mime_type: str) -> str:
        """Saves file content to storage and returns the normalized storage key."""
        pass

    @abstractmethod
    async def get_stream(self, storage_key: str) -> BinaryIO:
        """Returns a binary stream of the stored file content."""
        pass

    @abstractmethod
    async def get_download_url(self, storage_key: str, expires_in: int = 3600) -> str:
        """Returns an authorized download or streaming URL for the stored asset."""
        pass

    @abstractmethod
    async def delete(self, storage_key: str) -> bool:
        """Deletes the stored asset."""
        pass

    @abstractmethod
    async def exists(self, storage_key: str) -> bool:
        """Checks if the stored asset exists."""
        pass
