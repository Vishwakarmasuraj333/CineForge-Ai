import pytest
from httpx import AsyncClient

from app.core.exceptions import ValidationException
from app.media.validation import validate_image_upload
from app.storage.local import LocalStorage


@pytest.mark.asyncio
async def test_path_traversal_defense():
    storage = LocalStorage()
    with pytest.raises(ValueError, match="Path traversal attempt detected"):
        storage._resolve_path("../../windows/system32/cmd.exe")


def test_mime_spoofing_defense():
    fake_png = b"<html><script>alert('xss')</script></html>"
    with pytest.raises(ValidationException):
        validate_image_upload(fake_png, "innocent.png")


@pytest.mark.asyncio
async def test_cross_user_generation_isolation(client: AsyncClient):
    # Register User 1
    u1 = await client.post(
        "/api/v1/auth/register",
        json={"email": "alpha@cineforge.ai", "password": "Password123!", "display_name": "Alpha"},
    )
    token1 = u1.json()["access_token"]
    h1 = {"Authorization": f"Bearer {token1}"}

    # Register User 2
    u2 = await client.post(
        "/api/v1/auth/register",
        json={"email": "beta@cineforge.ai", "password": "Password123!", "display_name": "Beta"},
    )
    token2 = u2.json()["access_token"]
    h2 = {"Authorization": f"Bearer {token2}"}

    # User 1 creates project & generation
    p = await client.post("/api/v1/projects", json={"title": "Alpha Project"}, headers=h1)
    pid = p.json()["id"]

    gen = await client.post(
        "/api/v1/generations",
        json={"project_id": pid, "prompt": "Cinematic galaxy collision, 8k", "idempotency_key": "sec_gen_1"},
        headers=h1,
    )
    gid = gen.json()["id"]

    # User 2 CANNOT access User 1's generation (403 Forbidden)
    res_forbidden = await client.get(f"/api/v1/generations/{gid}", headers=h2)
    assert res_forbidden.status_code == 403

    # User 2 CANNOT cancel User 1's generation (403 Forbidden)
    cancel_forbidden = await client.post(f"/api/v1/generations/{gid}/cancel", headers=h2)
    assert cancel_forbidden.status_code == 403


@pytest.mark.asyncio
async def test_admin_route_forbidden_for_standard_user(client: AsyncClient):
    # Register standard user
    u = await client.post(
        "/api/v1/auth/register",
        json={"email": "standard@cineforge.ai", "password": "Password123!", "display_name": "Standard"},
    )
    token = u.json()["access_token"]
    h = {"Authorization": f"Bearer {token}"}

    # Attempt to access /admin/overview
    admin_res = await client.get("/api/v1/admin/overview", headers=h)
    assert admin_res.status_code == 403
