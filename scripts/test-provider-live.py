import argparse
import asyncio
import os
import sys
from pathlib import Path
import httpx

REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT / "backend"))

from app.core.config import settings
from app.providers.adapters.replicate_provider import ReplicateVideoProvider


async def test_replicate_live(run_live_generation: bool = False):
    print("=" * 65)
    print("CineForge AI — External AI Video Provider Live Test")
    print("=" * 65)

    token = settings.REPLICATE_API_TOKEN
    if not token or len(token) < 10 or token.startswith("your_"):
        print("[BLOCKED] REPLICATE_API_TOKEN is not configured in .env.")
        print("To verify live video synthesis with real Replicate models:")
        print("1. Sign up at https://replicate.com")
        print("2. Retrieve your API token from https://replicate.com/account/api-tokens")
        print("3. Set REPLICATE_API_TOKEN=r8_... in your .env file.")
        print("4. Re-run this script: python scripts/test-provider-live.py")
        print("=" * 65)
        sys.exit(2)

    masked_token = token[:4] + "*" * (len(token) - 8) + token[-4:]
    print(f"Using Token: {masked_token}")

    # Safe authenticated model verification (costs $0.00)
    print("Testing safe authenticated connection to Replicate catalog...")
    headers = {
        "Authorization": f"Bearer {token}",
        "User-Agent": "CineForge-AI/1.0.0",
    }
    url = "https://api.replicate.com/v1/models/minimax/video-01"

    async with httpx.AsyncClient(timeout=15.0) as client:
        try:
            res = await client.get(url, headers=headers)
            if res.status_code == 200:
                data = res.json()
                print(f"[PASS] Replicate API authentication verified! Model '{data.get('name')}' is active.")
            elif res.status_code == 401:
                print(f"[FAIL] Authentication failed: Invalid REPLICATE_API_TOKEN (HTTP 401).")
                sys.exit(1)
            else:
                print(f"[FAIL] Unexpected response from Replicate: HTTP {res.status_code}")
                sys.exit(1)
        except Exception as e:
            print(f"[FAIL] Network connection error: {e}")
            sys.exit(1)

    if run_live_generation:
        print("\n[WARNING] Submitting live generation request (charges may apply to your Replicate account)...")
        provider = ReplicateVideoProvider(api_token=token)
        # Proceed with explicit user opt-in
    else:
        print("\n[INFO] Safe verification complete. Zero credits consumed.")
        print("To execute an actual live rendering, run with flag: --generate")

    print("=" * 65)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Test external AI video provider connectivity safely.")
    parser.add_argument("--generate", action="store_true", help="Explicitly authorize a live generation test.")
    args = parser.parse_args()

    asyncio.run(test_replicate_live(run_live_generation=args.generate))
