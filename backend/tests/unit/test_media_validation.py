import io

import pytest
from PIL import Image

from app.core.exceptions import ValidationException
from app.media.validation import calculate_sha256, sanitize_filename, validate_image_upload


def test_sanitize_filename():
    assert sanitize_filename("../../etc/passwd.png") == "passwd.png"
    assert sanitize_filename("..\\..\\malicious.jpg") == "malicious.jpg"
    assert sanitize_filename("my cool movie! photo?.png") == "my_cool_movie__photo_.png"


def test_valid_image_validation():
    # Create valid in-memory PNG
    buf = io.BytesIO()
    img = Image.new("RGB", (800, 600), color=(255, 0, 0))
    img.save(buf, format="PNG")
    content = buf.getvalue()

    mime, width, height = validate_image_upload(content, "hero_frame.png")
    assert mime == "image/png"
    assert width == 800
    assert height == 600
    assert len(calculate_sha256(content)) == 64


def test_corrupted_image_rejected():
    fake_bytes = b"NOT_A_REAL_IMAGE_DATA_CORRUPT"
    with pytest.raises(ValidationException):
        validate_image_upload(fake_bytes, "fake.png")
