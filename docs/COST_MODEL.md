# CineForge AI — Transparent Cost & Unit Economics Model

## 1. Overview
Generative video models consume significant computational GPU resources (typically clusters of NVIDIA H100/A100 GPUs). CineForge AI implements upfront cost estimation and persistent ledger reconciliation.

---

## 2. Verified Provider Model Pricing Catalog

| Provider | Model Name | Primary Use-Case | Rate per Video Second (USD) | 5-Second Generation Cost | 10-Second Generation Cost |
|---|---|---|---|---|---|
| Replicate | Minimax Video-01 | High-action cinematic realism | $0.080 | $0.400 | $0.800 |
| Replicate | Kling v1 Standard | Photorealistic character motion | $0.070 | $0.350 | $0.700 |
| Replicate | CogVideoX 5B | Open-weights rapid synthesis | $0.030 | $0.150 | $0.300 |
| Fal.ai | Luma Dream Machine | High temporal consistency | $0.065 | $0.325 | $0.650 |
| Local / CI | CineForge Mock Fast | Deterministic offline verification | $0.010 (Simulated) | $0.050 | $0.100 |

---

## 3. Cost Estimation Algorithm
Before any job is submitted to an external provider, the backend calculates the estimated charge:

$$\text{Estimated Cost (USD)} = \text{Model Rate (USD/sec)} \times \text{Duration (seconds)}$$

Example:
- Model: `minimax-video-01` ($0.08/sec)
- Duration: 5 seconds
- Cost: $0.08 \times 5 = \$0.40 \text{ USD}$

---

## 4. Double-Charging Prevention & Idempotency
To prevent accidental duplicate billing from browser double-clicks or worker retries:
1. Every generation request is assigned an `idempotency_key` based on SHA-256 hash of `user_id + project_id + prompt + parameters`.
2. Duplicate submissions within an active cycle return the existing generation record rather than queueing a second billable inference job.
3. Actual costs are reconciled in `usage_records` table only upon successful verified media download.
