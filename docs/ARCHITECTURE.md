# CineForge AI — Architectural Specification

## 1. System Overview
**CineForge AI** is a production-style, multi-model generative AI platform designed for high-fidelity video synthesis, prompt intelligence, and scene planning.

```mermaid
flowchart TD
    subgraph Frontend["Frontend Layer (Next.js 14 App Router)"]
        UI_Studio["Studio Creative Workspace"]
        UI_Dash["Dashboard & Activity"]
        UI_Auth["JWT Session Management"]
    end

    subgraph Backend["Backend Layer (FastAPI REST API)"]
        API_Auth["Auth & Security Service"]
        API_Proj["Project & Asset Service"]
        API_Gen["Generation State Engine"]
        API_Prompt["Prompt Intelligence Service"]
    end

    subgraph Queue["Asynchronous Processing Layer"]
        Worker["Background Queue / Celery Workers"]
        Polling["Provider Status Polling Loop"]
    end

    subgraph Adapters["AI Video Provider Layer"]
        Registry["Provider Registry Factory"]
        Replicate["Replicate Adapter (Minimax, Kling, CogVideoX)"]
        Mock["Mock Deterministic Adapter"]
    end

    subgraph Persistence["Storage & Persistence"]
        DB[("PostgreSQL / SQLite")]
        StorageDriver["Object Storage (S3 / Local)"]
    end

    UI_Studio -->|REST API Calls| API_Gen
    UI_Studio -->|Prompt Enhancement| API_Prompt
    UI_Auth -->|JWT Authentication| API_Auth
    API_Gen -->|Persist Job| DB
    API_Gen -->|Enqueue Job| Worker
    Worker --> Registry
    Registry --> Replicate
    Registry --> Mock
    Worker --> Polling
    Polling -->|Download & Checksum| StorageDriver
    StorageDriver -->|Secure Asset Serving| UI_Studio
```

---

## 2. Key Modules & Separation of Concerns

### 2.1 Backend API Layer (`backend/app/api/v1/`)
- **FastAPI Framework:** High-performance asynchronous REST endpoints with automated OpenAPI schemas (`/docs`).
- **Dependencies (`dependencies.py`):** Centralized JWT bearer authentication, role enforcement (`USER`, `ADMIN`, `SYSTEM_WORKER`), and scoped database session handling.

### 2.2 Domain Services (`backend/app/services/`)
- `auth_service.py`: Password hashing with Bcrypt, token rotation, and audit logging.
- `project_service.py`: Multi-tenant project workspace CRUD with strict user isolation.
- `generation_service.py`: Core state machine tracking `QUEUED` -> `SUBMITTED` -> `PROCESSING` -> `DOWNLOADING` -> `SUCCEEDED` / `FAILED`. Idempotency key checking prevents duplicate billing.
- `asset_service.py`: File signature validation, SHA-256 checksumming, and storage management.
- `prompt_service.py`: Bilingual Hindi & English cinematic prompt decomposition.

### 2.3 Provider Abstraction (`backend/app/providers/`)
- Unified `BaseVideoProvider` interface decouples core logic from proprietary vendor APIs.
- Concrete adapters for Replicate and Fal.ai handle payload mapping, polling, and video streaming.
- `MockVideoProvider` provides zero-cost, deterministic local and CI verification.

### 2.4 Asynchronous Worker System (`backend/app/workers/`)
- Long-running inference jobs do not block standard web requests.
- Decoupled worker handles polling loops, status updates, and download streaming.
