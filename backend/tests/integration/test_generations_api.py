import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_generation_lifecycle_and_idempotency(client: AsyncClient):
    # Register user
    reg = await client.post(
        "/api/v1/auth/register",
        json={"email": "producer@cineforge.ai", "password": "ProducerPassword123!", "display_name": "Producer"},
    )
    token = reg.json()["access_token"]
    header = {"Authorization": f"Bearer {token}"}

    # Create project
    proj = await client.post("/api/v1/projects", json={"title": "Solaris Odyssey"}, headers=header)
    proj_id = proj.json()["id"]

    # Submit generation
    # Submit generation with explicit idempotency key
    gen_payload = {
        "project_id": proj_id,
        "prompt": "Cinematic spaceship docking at an orbital station over Saturn, 8k",
        "generation_type": "text_to_video",
        "provider_name": "mock",
        "provider_model_id": "cineforge-mock-v1",
        "idempotency_key": "test_idempotency_fixed_key_01",
        "parameters": {"aspect_ratio": "16:9", "duration_seconds": 5, "resolution": "720p"},
    }
    gen_res = await client.post("/api/v1/generations", json=gen_payload, headers=header)
    assert gen_res.status_code == 201
    gen_data = gen_res.json()
    assert gen_data["status"] in ["QUEUED", "SUBMITTED"]
    assert gen_data["estimated_cost"] == 0.05
    gen_id = gen_data["id"]

    # Test idempotency - duplicate submission with same key returns identical generation
    dup_res = await client.post("/api/v1/generations", json=gen_payload, headers=header)
    assert dup_res.status_code == 201
    assert dup_res.json()["id"] == gen_id

    # Test conflicting idempotency key reuse returns 422
    conflict_payload = dict(gen_payload)
    conflict_payload["prompt"] = "Completely different prompt attempting to reuse key"
    conflict_res = await client.post("/api/v1/generations", json=conflict_payload, headers=header)
    assert conflict_res.status_code == 422

    # Get generation status
    get_res = await client.get(f"/api/v1/generations/{gen_id}", headers=header)
    assert get_res.status_code == 200
    assert get_res.json()["prompt"] == gen_payload["prompt"]

