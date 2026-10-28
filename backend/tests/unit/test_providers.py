from unittest.mock import MagicMock, patch

import pytest

from app.core.exceptions import ValidationException
from app.providers.adapters.mock_provider import MockVideoProvider
from app.providers.adapters.replicate_provider import ReplicateVideoProvider
from app.providers.errors import (
    ProviderAuthError,
    ProviderInsufficientCreditError,
    ProviderRateLimitError,
)
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


def test_replicate_provider_capabilities():
    provider = ReplicateVideoProvider(api_token="r8_test_dummy_token_123456789")
    caps = provider.get_capabilities()
    assert caps.provider_name == "replicate"
    assert caps.is_configured is True
    assert len(caps.models) == 3
    model_ids = [m.model_id for m in caps.models]
    assert "minimax-video-01" in model_ids
    assert "kling-v1-standard" in model_ids
    assert "cogvideox-5b" in model_ids

    # Cost estimation
    assert provider.estimate_cost("minimax-video-01", 5, "720p") == 0.40
    assert provider.estimate_cost("kling-v1-standard", 10, "1080p") == 0.70
    assert provider.estimate_cost("cogvideox-5b", 5, "720p") == 0.15


def test_replicate_validation_rules():
    # Missing token
    unconfigured = ReplicateVideoProvider(api_token="")
    req = VideoGenerationRequest(
        generation_id="gen-req-01",
        prompt="Futuristic airship landing in the mountains",
        model_id="minimax-video-01",
        aspect_ratio="16:9",
        duration_seconds=5,
    )
    with pytest.raises(ValidationException, match="API key is not configured"):
        unconfigured.validate_request(req)

    # Invalid model
    configured = ReplicateVideoProvider(api_token="r8_test_dummy_token_123456789")
    req_bad_model = VideoGenerationRequest(
        generation_id="gen-req-02",
        prompt="Valid prompt",
        model_id="non-existent-video-model",
        aspect_ratio="16:9",
        duration_seconds=5,
    )
    with pytest.raises(ValidationException, match="Unsupported model"):
        configured.validate_request(req_bad_model)

    # Invalid aspect ratio for model
    req_bad_ratio = VideoGenerationRequest(
        generation_id="gen-req-03",
        prompt="Valid prompt",
        model_id="cogvideox-5b",
        aspect_ratio="1:1",  # CogVideoX supports only 16:9 and 9:16
        duration_seconds=5,
    )
    with pytest.raises(ValidationException, match="Aspect ratio"):
        configured.validate_request(req_bad_ratio)


@pytest.mark.asyncio
async def test_replicate_adapter_http_lifecycle():
    provider = ReplicateVideoProvider(api_token="r8_test_valid_mock_token_123456")
    req = VideoGenerationRequest(
        generation_id="gen-lifecycle-01",
        prompt="Cinematic shot of neon rain over neo-Tokyo",
        model_id="minimax-video-01",
        aspect_ratio="16:9",
        duration_seconds=5,
    )

    # 1. Mock Submission Success
    mock_post_res = MagicMock()
    mock_post_res.status_code = 201
    mock_post_res.json.return_value = {
        "id": "pred_mock_987654321",
        "status": "starting",
        "model": "minimax/video-01",
    }

    with patch("httpx.AsyncClient.post", return_value=mock_post_res):
        job = await provider.submit_generation(req)
        assert job.provider_job_id == "pred_mock_987654321"
        assert job.status == "SUBMITTED"

    # 2. Mock Polling: Succeeded
    mock_get_succeeded = MagicMock()
    mock_get_succeeded.status_code = 200
    mock_get_succeeded.json.return_value = {
        "id": "pred_mock_987654321",
        "status": "succeeded",
        "output": ["https://replicate.delivery/pbxt/sample_video.mp4"],
    }

    with patch("httpx.AsyncClient.get", return_value=mock_get_succeeded):
        poll_status = await provider.get_generation_status("pred_mock_987654321")
        assert poll_status.status == "SUCCEEDED"
        assert poll_status.progress_percent == 100
        assert poll_status.output_video_url == "https://replicate.delivery/pbxt/sample_video.mp4"

    # 3. Mock Polling: Failed
    mock_get_failed = MagicMock()
    mock_get_failed.status_code = 200
    mock_get_failed.json.return_value = {
        "id": "pred_mock_987654321",
        "status": "failed",
        "error": "GPU memory allocation exceeded at provider.",
    }

    with patch("httpx.AsyncClient.get", return_value=mock_get_failed):
        poll_status = await provider.get_generation_status("pred_mock_987654321")
        assert poll_status.status == "FAILED"
        assert "GPU memory" in poll_status.error_message

    # 4. Mock Error: HTTP 401 Unauthorized
    mock_post_401 = MagicMock()
    mock_post_401.status_code = 401
    mock_post_401.text = "Unauthenticated token"
    with patch("httpx.AsyncClient.post", return_value=mock_post_401):
        with pytest.raises(ProviderAuthError):
            await provider.submit_generation(req)

    # 5. Mock Error: HTTP 429 Rate Limit
    mock_post_429 = MagicMock()
    mock_post_429.status_code = 429
    mock_post_429.text = "Rate limit reached"
    with patch("httpx.AsyncClient.post", return_value=mock_post_429):
        with pytest.raises(ProviderRateLimitError):
            await provider.submit_generation(req)

    # 6. Mock Error: HTTP 402 Insufficient Credit
    mock_post_402 = MagicMock()
    mock_post_402.status_code = 402
    mock_post_402.text = '{"title":"Insufficient credit"}'
    with patch("httpx.AsyncClient.post", return_value=mock_post_402):
        with pytest.raises(ProviderInsufficientCreditError):
            await provider.submit_generation(req)


@pytest.mark.asyncio
async def test_replicate_image_to_video_files_upload():
    provider = ReplicateVideoProvider(api_token="r8_test_valid_mock_token_123456")

    # Mock file upload to Replicate files API
    mock_files_res = MagicMock()
    mock_files_res.status_code = 201
    mock_files_res.json.return_value = {
        "id": "file_123456",
        "urls": {"get": "https://api.replicate.com/v1/files/sample_cdn_image.jpg"},
    }

    mock_post_pred = MagicMock()
    mock_post_pred.status_code = 201
    mock_post_pred.json.return_value = {
        "id": "pred_img2vid_12345",
        "status": "starting",
    }

    with patch("httpx.AsyncClient.post", side_effect=[mock_files_res, mock_post_pred]):
        req = VideoGenerationRequest(
            generation_id="gen-img2vid-01",
            prompt="Cinematic zoom in on character portrait",
            generation_type="image_to_video",
            model_id="minimax-video-01",
            aspect_ratio="16:9",
            duration_seconds=5,
            input_image_url="data:image/jpeg;base64,/9j/4AAQSkZJRg==",
        )
        job = await provider.submit_generation(req)
        assert job.provider_job_id == "pred_img2vid_12345"
        assert job.status == "SUBMITTED"

