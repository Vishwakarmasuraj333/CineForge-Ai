from fastapi import APIRouter

from app.api.v1.admin import router as admin_router
from app.api.v1.assets import router as assets_router
from app.api.v1.auth import router as auth_router
from app.api.v1.generations import router as generations_router
from app.api.v1.health import router as health_router
from app.api.v1.projects import router as projects_router
from app.api.v1.prompt import router as prompt_router
from app.api.v1.providers import router as providers_router
from app.api.v1.usage import router as usage_router

api_v1_router = APIRouter()

api_v1_router.include_router(health_router)
api_v1_router.include_router(auth_router)
api_v1_router.include_router(projects_router)
api_v1_router.include_router(generations_router)
api_v1_router.include_router(assets_router)
api_v1_router.include_router(usage_router)
api_v1_router.include_router(providers_router)
api_v1_router.include_router(prompt_router)
api_v1_router.include_router(admin_router)
