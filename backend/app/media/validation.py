import hashlib
import io
import re
from typing import Tuple

from PIL import Image

from app.core.config import settings
from app.core.exceptions import ValidationException

# Magic byte signatures
MAGIC_SIGNATURES = {
    b"\x89PNG\r\n\x1a\n": "image/png",
    b"\xff\xd8\xff": "image/jpeg",
    b"RIFF": "image/webp",  # WebP starts with RIFF....WEBP
    b"\x00\x00\x00\x18ftypmp42": "video/mp4",
    b"\x00\x00\x00\x20ftypisom": "video/mp4",
    b"\x00\x00\x00\x1cftypisom": "video/mp4",
    b"\x1a\x45\xdf\xa3": "video/webm",
}


def sanitize_filename(filename: str) -> str:
    """Sanitizes filename, stripping path traversals and special characters."""
    filename = filename.replace("\\", "/").split("/")[-1]
    filename = re.sub(r"[^\w\.\-_]", "_", filename)
    return filename or "asset"


def calculate_sha256(content: bytes) -> str:
    """Calculates SHA-256 checksum of content."""
    return hashlib.sha256(content).hexdigest()


def validate_image_upload(content: bytes, filename: str) -> Tuple[str, int, int]:
    """
    Validates uploaded image:
    1. Size limit
    2. Extension
    3. Magic signature & PIL validation
    Returns: (mime_type, width, height)
    """
    if len(content) > settings.MAX_UPLOAD_SIZE_BYTES:
        raise ValidationException(
            f"File size exceeds maximum allowed limit of {settings.MAX_UPLOAD_SIZE_BYTES / (1024 * 1024):.1f} MB"
        )

    ext = filename.split(".")[-1].lower() if "." in filename else ""
    if ext not in settings.ALLOWED_IMAGE_EXTENSIONS:
        raise ValidationException(
            f"Extension '.{ext}' is not supported. Allowed: {', '.join(settings.ALLOWED_IMAGE_EXTENSIONS)}"
        )

    try:
        image = Image.open(io.BytesIO(content))
        image.verify()  # Verify integrity
        # Re-open for size after verify()
        image = Image.open(io.BytesIO(content))
        width, height = image.size
        mime = Image.MIME.get(image.format, f"image/{ext}")
        return mime, width, height
    except Exception as e:
        raise ValidationException(f"Invalid image file or corrupted image data: {str(e)}")
