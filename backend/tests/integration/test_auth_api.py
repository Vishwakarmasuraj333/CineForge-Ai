import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_auth_registration_and_login_flow(client: AsyncClient):
    # Register
    reg_payload = {
        "email": "director@cineforge.ai",
        "password": "SuperCinematicPassword2026!",
        "display_name": "Christopher Director",
    }
    reg_res = await client.post("/api/v1/auth/register", json=reg_payload)
    assert reg_res.status_code == 201
    tokens = reg_res.json()
    assert "access_token" in tokens
    assert "refresh_token" in tokens

    # Test /auth/me
    auth_header = {"Authorization": f"Bearer {tokens['access_token']}"}
    me_res = await client.get("/api/v1/auth/me", headers=auth_header)
    assert me_res.status_code == 200
    user_data = me_res.json()
    assert user_data["email"] == "director@cineforge.ai"
    assert user_data["display_name"] == "Christopher Director"

    # Login
    login_payload = {
        "email": "director@cineforge.ai",
        "password": "SuperCinematicPassword2026!",
    }
    login_res = await client.post("/api/v1/auth/login", json=login_payload)
    assert login_res.status_code == 200
    assert "access_token" in login_res.json()


@pytest.mark.asyncio
async def test_auth_duplicate_email_rejected(client: AsyncClient):
    reg_payload = {
        "email": "duplicate@cineforge.ai",
        "password": "Password123!",
        "display_name": "User 1",
    }
    r1 = await client.post("/api/v1/auth/register", json=reg_payload)
    assert r1.status_code == 201

    r2 = await client.post("/api/v1/auth/register", json=reg_payload)
    assert r2.status_code == 422
    assert "already exists" in r2.json()["message"]

