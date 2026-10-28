import json
from pathlib import Path


def generate_evaluation_report():
    results_file = Path(__file__).resolve().parent.parent / "results" / "benchmark_results.json"
    if not results_file.exists():
        print("No benchmark results found. Run benchmark.py first.")
        return

    with open(results_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    md = f"""# CineForge AI — Empirical Evaluation & Research Report
**Study Title:** Design and Evaluation of a Cost-Aware Generative AI Pipeline for Text-to-Video and Image-to-Video Applications  
**Date Evaluated:** {data['timestamp']}  
**Total Experiments Conducted:** {data['total_experiments']}

---

## 1. Reliability & Quality Summary
- **Pipeline Completion Rate:** {data['reliability']['success_rate']}%
- **Provider Error Rate:** {data['reliability']['error_rate']}%
- **Cost Efficiency:** ${data['cost_efficiency_usd_per_sec']:.4f} USD per video second

## 2. Latency Distribution
| Metric | Value (Seconds) |
|---|---|
| Sample Count | {data['latency']['count']} |
| Mean Latency | {data['latency']['mean']}s |
| Median Latency (P50) | {data['latency']['median']}s |
| 95th Percentile (P95) | {data['latency']['p95']}s |
| Min Latency | {data['latency']['min']}s |
| Max Latency | {data['latency']['max']}s |

## 3. Individual Experiment Observations
| Test ID | Category | Prompt Excerpt | Status | Latency (s) | Cost ($) |
|---|---|---|---|---|---|
"""
    for exp in data["experiments"]:
        excerpt = exp["prompt"][:40] + "..."
        md += f"| {exp['test_id']} | {exp['category']} | {excerpt} | `{exp['status']}` | {exp['latency_seconds']}s | ${exp['cost_usd']:.3f} |\n"

    md += """
---
*Note: In accordance with academic honesty standards, mock pipeline simulation benchmarks were executed under controlled evaluation conditions to ensure full test reproducibility without consuming live credit quotas.*
"""

    report_path = Path(__file__).resolve().parent.parent / "results" / "EVALUATION_REPORT.md"
    with open(report_path, "w", encoding="utf-8") as f:
        f.write(md)

    print(f"Generated academic evaluation report at: {report_path}")


if __name__ == "__main__":
    generate_evaluation_report()
