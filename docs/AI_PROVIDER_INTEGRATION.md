# External AI Video Generation Provider Integration Guide

## 1. Executive Summary
CineForge AI does not hardcode vendor-specific calls into business logic. Instead, it defines an extensible provider architecture through `BaseVideoProvider`.

---

## 2. Supported Primary Providers

### 2.1 Replicate AI Video API
- **Official Documentation:** https://replicate.com/docs/reference/http
- **Authentication:** Bearer token passed in `Authorization: Bearer <token>`
- **Endpoint Structure:**
  - Prediction Submission: `POST https://api.replicate.com/v1/models/{model_owner}/{model_name}/predictions`
  - Status Polling: `GET https://api.replicate.com/v1/predictions/{id}`
  - Cancellation: `POST https://api.replicate.com/v1/predictions/{id}/cancel`
- **Supported Models Integrated:**
  - `minimax/video-01`: State-of-the-art cinematic motion text-to-video and image-to-video.
  - `kwaivgi/kling-v1`: High-fidelity 1080p photorealistic human and object dynamics.
  - `lucataco/cogvideox-5b`: Open-weights diffusion model supporting efficient 720p text-to-video.
- **Output Retrieval:** Direct streaming from high-speed temporary signed CDN URLs to private application storage driver.

### 2.2 Fal.ai Video API
- **Official Documentation:** https://fal.ai/docs
- **Authentication:** Key passed via `Authorization: Key <key>`
- **Endpoint Structure:**
  - Async Queue: `POST https://queue.fal.run/{model_id}`
  - Status Polling: `GET https://queue.fal.run/{model_id}/requests/{request_id}/status`
- **Supported Models:**
  - Luma Dream Machine
  - HunyuanVideo (Tencent Open Architecture)

### 2.3 Deterministic Mock Video Provider
- **Purpose:** Continuous Integration, automated testing, and zero-cost local developer onboarding without consuming expensive video API credits.
- **Characteristics:** Simulates real state transitions (`QUEUED` -> `SUBMITTED` -> `PROCESSING` -> `SUCCEEDED`), generates valid MP4 container payloads, and validates parameters identically to real providers.

---

## 3. Provider Security Guidelines
1. Provider API keys are strictly kept server-side in backend environment variables (`REPLICATE_API_TOKEN`, `FAL_KEY`).
2. Keys are never transmitted to the frontend browser or bundled in client-side code.
3. Raw error responses from external providers are sanitized before reaching users (`safe_error_message`).
