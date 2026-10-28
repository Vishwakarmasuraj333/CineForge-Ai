import pytest

from app.core.exceptions import AuthenticationException
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)


def test_password_hashing():
    raw = "CinematicStudioSecret2026!"
    hashed = hash_password(raw)
    assert hashed != raw
    assert verify_password(raw, hashed) is True
    assert verify_password("WrongPassword!", hashed) is False


def test_jwt_access_and_refresh_tokens():
    sub = "user-12345"
    access = create_access_token(subject=sub, role="USER")
    payload = decode_token(access)
    assert payload["sub"] == sub
    assert payload["role"] == "USER"
    assert payload["type"] == "access"

    refresh = create_refresh_token(subject=sub)
    r_payload = decode_token(refresh)
    assert r_payload["sub"] == sub
    assert r_payload["type"] == "refresh"


def test_invalid_token_rejected():
    with pytest.raises(AuthenticationException):
        decode_token("invalid.token.payload")
