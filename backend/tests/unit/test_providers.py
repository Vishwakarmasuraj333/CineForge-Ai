import pytest

from app.providers.adapters.mock_provider import MockVideoProvider
from app.providers.schemas import VideoGenerationRequest


@pytest.mark.asyncio
async def test_mock_provider_lifecycle():
    provider = MockVideoProvider()
    caps = provider.get_capabilities()
    assert caps.provider_name == "mock"
    assert len(caps.models) >= 2

    req = VideoGenerationRequest(
        generation_id="test-gen-101",
        prompt="A robotic camera panning through a cyberpunk forest",
        model_id="cineforge-mock-v1",
        aspect_ratio="16:9",
        duration_seconds=5,
    )

    # Submit
    status1 = await provider.submit_generation(req)
    assert status1.status == "SUBMITTED"
    assert status1.provider_job_id == "mock_job_test-gen-101"

    # Poll 1
    status2 = await provider.get_generation_status(status1.provider_job_id)
    assert status2.status == "PROCESSING"

    # Poll 2
    status3 = await provider.get_generation_status(status1.provider_job_id)
    assert status3.status == "SUCCEEDED"
    assert status3.output_video_url is not None

    # Download output
    data = await provider.download_output(status3.output_video_url)
    assert len(data) > 0


def test_cost_estimation():
    provider = MockVideoProvider()
    cost = provider.estimate_cost("cineforge-mock-v1", duration_seconds=10, resolution="720p")
    assert cost == 0.10
