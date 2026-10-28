# CineForge AI — Machine Learning & Academic Evaluation Module

## 1. Research Overview
**Title:** Design and Evaluation of a Cost-Aware Generative AI Pipeline for Text-to-Video and Image-to-Video Applications  
**Field:** Full-Stack Generative AI / Multi-Model Orchestration / Computational Video Generation  
**Target Submission:** M.Sc. IT Major Project

## 2. Research Questions
1. **Adherence & Prompt Decomposition:** How does automated structural prompt enrichment (decoupling subject, lighting, camera movement, and aesthetic tags) influence diffusion video fidelity?
2. **Asynchronous Reliability:** How effectively can asynchronous worker polling loops and state machines protect users against provider timeouts, API rate limits, and network dropped connections?
3. **Cost-Quality Trade-Offs:** What are the empirical cost-per-second metrics across open-weight models (CogVideoX 5B) versus proprietary video architectures (Minimax Video-01, Kling-v1)?
4. **Idempotency in Metered Compute:** How does cryptographic request hashing prevent duplicate billing under retry conditions?

## 3. Directory Layout
- `evaluation/benchmark.py`: Reproducible evaluation harness testing prompts across multiple creative categories.
- `evaluation/metrics.py`: Statistical algorithms computing Mean, Median, P95 latency distributions, success rates, and unit cost ratios.
- `evaluation/report.py`: Automated compiler outputting structured Markdown and tabular reports.
- `results/`: Actual recorded benchmark metrics in `benchmark_results.json` and `EVALUATION_REPORT.md`.

## 4. Running the Benchmark
```bash
cd ml-research/evaluation
python benchmark.py
python report.py
```
