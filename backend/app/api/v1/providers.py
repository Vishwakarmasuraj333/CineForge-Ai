from fastapi import APIRouter

from app.core.config import settings
from app.providers.registry import provider_registry
from app.schemas.provider import ProviderCapabilityResponse, ProviderListResponse

router = APIRouter(prefix="/providers", tags=["AI Providers"])


@router.get("", response_model=ProviderListResponse)
async def list_providers():
    capabilities = provider_registry.list_capabilities()
    return ProviderListResponse(
        providers=capabilities,
        default_provider=settings.DEFAULT_VIDEO_PROVIDER,
    )


@router.get("/{provider_name}/capabilities", response_model=ProviderCapabilityResponse)
async def get_provider_capabilities(provider_name: str):
    provider = provider_registry.get_provider(provider_name)
    return provider.get_capabilities()
