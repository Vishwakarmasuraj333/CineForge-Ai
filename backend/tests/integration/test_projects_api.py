import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_projects_crud_and_cross_user_isolation(client: AsyncClient):
    # Register User A
    uA = await client.post(
        "/api/v1/auth/register",
        json={"email": "usera@cineforge.ai", "password": "PasswordA123!", "display_name": "User A"},
    )
    tokenA = uA.json()["access_token"]
    headerA = {"Authorization": f"Bearer {tokenA}"}

    # Register User B
    uB = await client.post(
        "/api/v1/auth/register",
        json={"email": "userb@cineforge.ai", "password": "PasswordB123!", "display_name": "User B"},
    )
    tokenB = uB.json()["access_token"]
    headerB = {"Authorization": f"Bearer {tokenB}"}

    # User A creates a project
    proj_res = await client.post(
        "/api/v1/projects",
        json={"title": "Neo Tokyo 2099", "description": "Sci-Fi cyberpunk teaser project"},
        headers=headerA,
    )
    assert proj_res.status_code == 201
    proj_id = proj_res.json()["id"]

    # User A can get it
    get_res = await client.get(f"/api/v1/projects/{proj_id}", headers=headerA)
    assert get_res.status_code == 200
    assert get_res.json()["title"] == "Neo Tokyo 2099"

    # User B CANNOT get User A's project (403 Forbidden cross-user barrier)
    forbidden_res = await client.get(f"/api/v1/projects/{proj_id}", headers=headerB)
    assert forbidden_res.status_code == 403

    # User A updates the project
    patch_res = await client.patch(
        f"/api/v1/projects/{proj_id}",
        json={"title": "Neo Tokyo 2099 - Director's Cut"},
        headers=headerA,
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["title"] == "Neo Tokyo 2099 - Director's Cut"

    # User A deletes project
    del_res = await client.delete(f"/api/v1/projects/{proj_id}", headers=headerA)
    assert del_res.status_code == 200

    # Project is soft deleted and not found
    not_found = await client.get(f"/api/v1/projects/{proj_id}", headers=headerA)
    assert not_found.status_code == 404

