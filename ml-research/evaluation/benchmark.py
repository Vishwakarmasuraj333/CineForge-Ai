import asyncio
import json
import time
from datetime import datetime, timezone
from pathlib import Path
import sys

# Ensure backend root is on sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent / "backend"))

from app.providers.adapters.mock_provider import MockVideoProvider
from app.providers.schemas import VideoGenerationRequest
from metrics import calculate_cost_efficiency, calculate_latency_metrics, calculate_reliability

BENCHMARK_PROMPTS = [
    {
        "category": "Cinematic Sci-Fi",
        "prompt": "An astronaut traversing obsidian dunes on Titan under a ringed Saturn twilight, 35mm lens, golden rim light, photorealistic",
        "aspect_ratio": "16:9",
        "duration": 5,
    },
    {
        "category": "Character Motion",
        "prompt": "A cybernetic artisan carefully assembling a clockwork hummingbird in a dimly lit Victorian workshop, macro close-up",
        "aspect_ratio": "16:9",
        "duration": 5,
    },
    {
        "category": "Atmospheric Nature",
        "prompt": "Bioluminescent mist drifting over misty pine trees in a mountain pass at dawn, slow aerial push-in, soft fog",
        "aspect_ratio": "16:9",
        "duration": 5,
    },
    {
        "category": "Urban Architecture",
        "prompt": "Rain-slicked neon street in Neo-Kyoto with reflections of flying vehicles, slow cinematic tracking shot, 8k",
        "aspect_ratio": "9:16",
        "duration": 5,
    },
]


async def run_benchmark():
    print("=" * 70)
    print("CineForge AI — Academic Evaluation Pipeline Benchmark")
    print(f"Timestamp: {datetime.now(timezone.utc).isoformat()}")
    print("=" * 70)

    provider = MockVideoProvider()
    results = []
    latencies = []
    total_cost = 0.0
    total_duration = 0.0

    for i, item in enumerate(BENCHMARK_PROMPTS, 1):
        print(f"\n[Test {i}/{len(BENCHMARK_PROMPTS)}] Category: {item['category']}")
        print(f"Prompt: {item['prompt'][:65]}...")

        start_time = time.perf_counter()
        req = VideoGenerationRequest(
            generation_id=f"eval-job-{i}",
            prompt=item["prompt"],
            model_id="cineforge-mock-v1",
            aspect_ratio=item["aspect_ratio"],
            duration_seconds=item["duration"],
        )

        # Submit
        status = await provider.submit_generation(req)

        # Poll until terminal
        attempts = 0
        while status.status not in ["SUCCEEDED", "FAILED", "CANCELLED"] and attempts < 10:
            await asyncio.sleep(0.5)
            status = await provider.get_generation_status(status.provider_job_id)
            attempts += 1

        elapsed = time.perf_counter() - start_time
        latencies.append(elapsed)
        cost = provider.estimate_cost("cineforge-mock-v1", item["duration"], "720p")
        total_cost += cost
        total_duration += item["duration"]

        print(f"Outcome: {status.status} | Latency: {elapsed:.3f}s | Cost: ${cost:.3f}")

        results.append({
            "test_id": i,
            "category": item["category"],
            "prompt": item["prompt"],
            "status": status.status,
            "latency_seconds": round(elapsed, 3),
            "cost_usd": cost,
            "duration_seconds": item["duration"],
        })

    # Summary Statistics
    latency_stats = calculate_latency_metrics(latencies)
    reliability_stats = calculate_reliability(len(results), sum(1 for r in results if r["status"] == "SUCCEEDED"))
    efficiency = calculate_cost_efficiency(total_cost, total_duration)

    summary_data = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "total_experiments": len(results),
        "latency": latency_stats,
        "reliability": reliability_stats,
        "cost_efficiency_usd_per_sec": efficiency,
        "experiments": results,
    }

    out_path = Path(__file__).resolve().parent.parent / "results" / "benchmark_results.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(summary_data, f, indent=2)

    print("\n" + "=" * 70)
    print("BENCHMARK SUMMARY RESULTS:")
    print(f"Total Runs: {len(results)}")
    print(f"Success Rate: {reliability_stats['success_rate']}%")
    print(f"Mean Latency: {latency_stats['mean']}s (Median: {latency_stats['median']}s, P95: {latency_stats['p95']}s)")
    print(f"Cost Efficiency: ${efficiency}/video-second")
    print(f"Results saved to: {out_path}")
    print("=" * 70)


if __name__ == "__main__":
    asyncio.run(run_benchmark())
