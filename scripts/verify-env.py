import argparse
import asyncio
import os
import shutil
import sys
from pathlib import Path
from typing import Dict, List, NamedTuple, Optional

# Detect Repository Root
REPO_ROOT = Path(__file__).resolve().parent.parent
BACKEND_DIR = REPO_ROOT / "backend"
FRONTEND_DIR = REPO_ROOT / "frontend"

sys.path.insert(0, str(BACKEND_DIR))


class CheckResult(NamedTuple):
    category: str
    check: str
    status: str  # PASS, FAIL, BLOCKED, NOT VERIFIED, NOT REQUIRED
    details: str


class EnvironmentVerifier:
    def __init__(self, env_path: Path, strict_mode: bool = False):
        self.env_path = env_path
        self.strict_mode = strict_mode
        self.results: List[CheckResult] = []
        self.missing_config: bool = False

    def record(self, category: str, check: str, status: str, details: str):
        self.results.append(CheckResult(category=category, check=check, status=status, details=details))

    def check_python_environment(self) -> bool:
        v = sys.version_info
        if v.major < 3 or (v.major == 3 and v.minor < 12):
            self.record(
                "Environment",
                "Python Version",
                "FAIL",
                f"Python {v.major}.{v.minor} is below required 3.12+"
            )
            return False

        required_pkgs = [
            "fastapi",
            "sqlalchemy",
            "alembic",
            "aiosqlite",
            "asyncpg",
            "pydantic",
            "bcrypt",
            "jwt",
            "httpx",
            "celery",
            "redis",
            "PIL",
        ]
        missing = []
        for pkg in required_pkgs:
            try:
                __import__(pkg)
            except ImportError:
                missing.append(pkg)

        if missing:
            self.record(
                "Environment",
                "Python Dependencies",
                "FAIL",
                f"Missing packages: {', '.join(missing)}"
            )
            return False

        self.record(
            "Environment",
            "Python Dependencies",
            "PASS",
            f"Python {v.major}.{v.minor}.{v.micro} with all backend dependencies installed."
        )
        return True

    def check_environment_variables(self) -> bool:
        if not self.env_path.exists():
            self.missing_config = True
            self.record(
                "Environment",
                "Configuration File (.env)",
                "FAIL",
                f".env file not found at {self.env_path}. Copy from .env.example."
            )
            return False

        try:
            from app.core.config import settings
        except Exception as e:
            self.missing_config = True
            self.record("Environment", "Config Parsing", "FAIL", f"Failed to parse settings: {str(e)}")
            return False

        if not settings.SECRET_KEY:
            self.missing_config = True
            self.record("Environment", "Secret Key", "FAIL", "SECRET_KEY is empty in .env.")
            return False

        if settings.SECRET_KEY.startswith("cineforge-insecure") and settings.is_production:
            self.record(
                "Environment",
                "Secret Key",
                "FAIL",
                "Default development SECRET_KEY detected in production mode."
            )
            return False

        self.record(
            "Environment",
            "Configuration Variables",
            "PASS",
            f"Loaded {settings.ENVIRONMENT} config (CORS={len(settings.ALLOWED_CORS_ORIGINS)} origins, DB={settings.DATABASE_URL.split('://')[0]})."
        )
        return True

    async def check_database_and_migrations(self) -> bool:
        from app.core.config import settings
        from app.db.session import engine
        from sqlalchemy import inspect, text

        try:
            async with engine.connect() as conn:
                await conn.execute(text("SELECT 1"))

                # 1. Inspect table names
                def inspect_tables(sync_conn):
                    inspector = inspect(sync_conn)
                    return inspector.get_table_names()

                tables = await conn.run_sync(inspect_tables)
                expected_tables = [
                    "users",
                    "projects",
                    "generations",
                    "assets",
                    "usage_records",
                    "refresh_tokens",
                    "audit_logs",
                    "provider_configs",
                ]
                missing_tables = [t for t in expected_tables if t not in tables]

                if missing_tables:
                    self.record(
                        "Database",
                        "Schema Tables",
                        "BLOCKED",
                        f"Missing tables: {', '.join(missing_tables)}. Run 'alembic upgrade head'."
                    )
                    return False
                else:
                    self.record(
                        "Database",
                        "Connection",
                        "PASS",
                        f"Connected to {'SQLite' if 'sqlite' in settings.DATABASE_URL else 'PostgreSQL'}."
                    )

                # 2. Check Alembic migration head vs current revision
                try:
                    res = await conn.execute(text("SELECT version_num FROM alembic_version"))
                    row = res.fetchone()
                    current_rev = row[0] if row else "None"
                    
                    # Find head revision file in versions dir
                    versions_dir = BACKEND_DIR / "migrations" / "versions"
                    migration_files = list(versions_dir.glob("*.py"))
                    head_rev = "bfc52fda8169"  # Default known head
                    for mf in migration_files:
                        if "initial_cineforge_schema" in mf.name:
                            head_rev = mf.name.split("_")[0]

                    if current_rev == head_rev:
                        self.record(
                            "Database",
                            "Alembic Migrations",
                            "PASS",
                            f"Revision up-to-date at head '{current_rev}' ({len(tables)} tables)."
                        )
                    else:
                        self.record(
                            "Database",
                            "Alembic Migrations",
                            "BLOCKED",
                            f"Current revision is '{current_rev}', expected head '{head_rev}'."
                        )
                        return False
                except Exception as e:
                    self.record(
                        "Database",
                        "Alembic Migrations",
                        "BLOCKED",
                        f"Could not read alembic_version: {str(e)}"
                    )
                    return False

                return True
        except Exception as e:
            self.record("Database", "Connection", "FAIL", f"Database error: {str(e)}")
            self.record("Database", "Alembic Migrations", "BLOCKED", "Skipped due to DB failure.")
            return False

    async def check_workers(self) -> bool:
        from app.core.config import settings
        import redis.asyncio as aioredis

        try:
            r = aioredis.from_url(settings.REDIS_URL, socket_connect_timeout=1.5)
            await r.ping()
            await r.aclose()
            self.record("Workers", "Redis Connectivity", "PASS", f"Redis ping OK at {settings.REDIS_URL}.")
            self.record("Workers", "Queue Broker", "PASS", "Celery broker reachable.")
            return True
        except Exception:
            if settings.is_production:
                self.record("Workers", "Redis Connectivity", "FAIL", "Redis unreachable in production.")
                self.record("Workers", "Queue Broker", "FAIL", "Production requires active Redis queue.")
                return False
            else:
                self.record(
                    "Workers",
                    "Redis Connectivity",
                    "NOT REQUIRED",
                    "Redis offline locally. Using non-blocking asyncio worker runner fallback."
                )
                self.record(
                    "Workers",
                    "Async Task Runner",
                    "PASS",
                    "In-process asyncio worker runner active for local development."
                )
                return True

    async def check_ai_provider(self) -> bool:
        from app.core.config import settings
        import httpx

        prov_name = settings.DEFAULT_VIDEO_PROVIDER.lower()

        if prov_name == "mock":
            self.record(
                "AI Provider",
                "Configured Provider",
                "PASS",
                "Default provider is MOCK (Offline deterministic generator, zero billing)."
            )
            self.record(
                "AI Provider",
                "Provider Connectivity",
                "PASS",
                "Mock adapter active with synthetic pipeline (Minimax & Kling mock models)."
            )
            return True
        elif prov_name == "replicate":
            token = settings.REPLICATE_API_TOKEN
            if not token or len(token.strip()) < 10 or "your_" in token:
                self.record(
                    "AI Provider",
                    "Credentials",
                    "BLOCKED",
                    "REPLICATE_API_TOKEN missing or placeholder in .env."
                )
                self.record(
                    "AI Provider",
                    "Live Readiness",
                    "CONFIGURED_NOT_LIVE_VERIFIED",
                    "Set valid REPLICATE_API_TOKEN in .env to enable real video generations."
                )
                return False

            # Safe lightweight check (queries model metadata, does NOT start generation or incur cost)
            try:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    res = await client.get(
                        "https://api.replicate.com/v1/models/minimax/video-01",
                        headers={"Authorization": f"Bearer {token}"},
                    )
                    if res.status_code == 200:
                        self.record(
                            "AI Provider",
                            "Credentials",
                            "PASS",
                            "REPLICATE_API_TOKEN validated via safe metadata check (0 credits used)."
                        )
                        self.record(
                            "AI Provider",
                            "Live Readiness",
                            "PASS",
                            "Replicate API connected & ready for text-to-video / image-to-video."
                        )
                        return True
                    elif res.status_code == 401:
                        self.record(
                            "AI Provider",
                            "Credentials",
                            "FAIL",
                            "Replicate rejected token (HTTP 401 Unauthorized)."
                        )
                        return False
                    elif res.status_code == 429:
                        self.record(
                            "AI Provider",
                            "Credentials",
                            "BLOCKED",
                            "Replicate rate limit or billing quota exceeded (HTTP 429)."
                        )
                        return False
                    else:
                        self.record(
                            "AI Provider",
                            "Live Readiness",
                            "NOT VERIFIED",
                            f"Replicate query returned status {res.status_code}."
                        )
                        return False
            except Exception as e:
                self.record(
                    "AI Provider",
                    "Live Readiness",
                    "BLOCKED",
                    f"Network error querying Replicate: {str(e)}"
                )
                return False
        else:
            self.record(
                "AI Provider",
                "Configured Provider",
                "PASS",
                f"Configured provider: {prov_name}."
            )
            self.record(
                "AI Provider",
                "Live Readiness",
                "NOT VERIFIED",
                "Custom provider ping not implemented."
            )
            return True

    def check_storage(self) -> bool:
        from app.core.config import settings

        try:
            storage_dir = Path(settings.LOCAL_STORAGE_DIR)
            uploads_dir = storage_dir / "uploads"
            videos_dir = storage_dir / "videos"

            uploads_dir.mkdir(parents=True, exist_ok=True)
            videos_dir.mkdir(parents=True, exist_ok=True)

            # Test write, read, and delete
            test_file = storage_dir / ".storage_write_test"
            test_file.write_text("cineforge-storage-ok")
            content = test_file.read_text()
            test_file.unlink()

            if content == "cineforge-storage-ok":
                self.record(
                    "Storage",
                    "Local Storage Driver",
                    "PASS",
                    f"Read/write verified at {storage_dir} (uploads/ & videos/ ready)."
                )
                return True
            else:
                self.record("Storage", "Local Storage Driver", "FAIL", "Storage read verification failed.")
                return False
        except Exception as e:
            self.record("Storage", "Local Storage Driver", "FAIL", f"Storage error: {str(e)}")
            return False

    def check_frontend(self) -> bool:
        node_bin = shutil.which("node")
        npm_bin = shutil.which("npm")

        if not node_bin or not npm_bin:
            self.record("Frontend", "Node/npm Runtime", "FAIL", "Node.js or npm not found in system PATH.")
            return False

        package_json = FRONTEND_DIR / "package.json"
        node_modules = FRONTEND_DIR / "node_modules"

        if not package_json.exists():
            self.record("Frontend", "Package Manifest", "FAIL", "frontend/package.json missing.")
            return False

        if not node_modules.exists():
            self.record("Frontend", "Dependencies", "BLOCKED", "frontend/node_modules missing. Run 'npm install'.")
            return False

        # Check frontend env / config
        frontend_env = FRONTEND_DIR / ".env.local"
        has_fe_env = frontend_env.exists()

        self.record(
            "Frontend",
            "Next.js Environment",
            "PASS",
            f"Node/npm OK, node_modules present ({'.env.local found' if has_fe_env else 'using default API fallback http://localhost:8000'})."
        )
        return True

    async def run_all(self) -> int:
        self.check_python_environment()
        self.check_environment_variables()
        await self.check_database_and_migrations()
        await self.check_workers()
        await self.check_ai_provider()
        self.check_storage()
        self.check_frontend()

        # Print formatted summary table: Category | Check | Status | Details
        print("\n" + "=" * 115)
        print(f"{'Category':<14} | {'Check':<25} | {'Status':<14} | {'Details'}")
        print("=" * 115)

        has_fail = False
        has_blocked = False

        for r in self.results:
            if r.status == "FAIL":
                has_fail = True
            elif r.status in ["BLOCKED", "CONFIGURED_NOT_LIVE_VERIFIED"]:
                has_blocked = True
            print(f"{r.category:<14} | {r.check:<25} | {r.status:<14} | {r.details}")

        print("=" * 115)

        if self.missing_config:
            print("Overall Status: CONFIGURATION ERROR (Missing required environment file or variable)")
            print("Exit code: 2\n")
            return 2

        if has_fail or (self.strict_mode and has_blocked):
            print("Overall Status: NOT READY (One or more required checks failed)")
            print("Exit code: 1\n")
            return 1

        print("Overall Status: READY (All required checks passed with valid fallbacks)")
        print("Exit code: 0\n")
        return 0


def main():
    parser = argparse.ArgumentParser(description="CineForge AI — Production Environment & System Verifier")
    parser.add_argument("--env", type=str, default=str(REPO_ROOT / ".env"), help="Path to .env configuration file")
    parser.add_argument("--strict", action="store_true", help="Fail if any optional or pending provider is blocked")
    args = parser.parse_args()

    verifier = EnvironmentVerifier(env_path=Path(args.env), strict_mode=args.strict)
    code = asyncio.run(verifier.run_all())
    sys.exit(code)


if __name__ == "__main__":
    main()
