import statistics
from typing import Dict, List


def calculate_latency_metrics(latencies: List[float]) -> Dict[str, float]:
    """Calculates distribution statistics for generation latency (in seconds)."""
    if not latencies:
        return {"count": 0, "mean": 0.0, "median": 0.0, "p95": 0.0, "min": 0.0, "max": 0.0}

    sorted_lats = sorted(latencies)
    n = len(sorted_lats)
    p95_idx = min(int(0.95 * n), n - 1)

    return {
        "count": n,
        "mean": round(statistics.mean(sorted_lats), 2),
        "median": round(statistics.median(sorted_lats), 2),
        "p95": round(sorted_lats[p95_idx], 2),
        "min": round(sorted_lats[0], 2),
        "max": round(sorted_lats[-1], 2),
    }


def calculate_reliability(total_attempts: int, successful_attempts: int) -> Dict[str, float]:
    """Calculates pipeline reliability and failure rates."""
    if total_attempts == 0:
        return {"success_rate": 0.0, "error_rate": 0.0}
    success_rate = (successful_attempts / total_attempts) * 100.0
    return {
        "success_rate": round(success_rate, 2),
        "error_rate": round(100.0 - success_rate, 2),
    }


def calculate_cost_efficiency(total_cost_usd: float, total_video_seconds: float) -> float:
    """Calculates average dollar cost per generated video second."""
    if total_video_seconds == 0:
        return 0.0
    return round(total_cost_usd / total_video_seconds, 4)
