import io
import shutil
import subprocess
from pathlib import Path

from PIL import Image

from app.core.logging import logger


def generate_image_thumbnail(image_bytes: bytes, max_size: tuple[int, int] = (640, 360)) -> bytes:
    """Generates a compressed JPEG thumbnail from image bytes."""
    with Image.open(io.BytesIO(image_bytes)) as img:
        img = img.convert("RGB")
        img.thumbnail(max_size, Image.Resampling.LANCZOS)
        out_buf = io.BytesIO()
        img.save(out_buf, format="JPEG", quality=85, optimize=True)
        return out_buf.getvalue()


def is_ffmpeg_available() -> bool:
    """Checks if ffmpeg binary is present in system PATH."""
    return shutil.which("ffmpeg") is not None


def extract_video_thumbnail_ffmpeg(video_path: Path, output_thumbnail_path: Path, timestamp_sec: float = 1.0) -> bool:
    """
    Extracts a frame from video using FFmpeg safely without shell interpolation.
    """
    if not is_ffmpeg_available():
        logger.warning("FFmpeg not installed. Video thumbnail extraction skipped.")
        return False

    cmd = [
        "ffmpeg",
        "-y",
        "-ss", str(timestamp_sec),
        "-i", str(video_path),
        "-vframes", "1",
        "-q:v", "2",
        str(output_thumbnail_path)
    ]
    try:
        result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=15)
        return result.returncode == 0 and output_thumbnail_path.exists()
    except Exception as e:
        logger.error(f"Failed to extract video thumbnail via FFmpeg: {e}")
        return False
