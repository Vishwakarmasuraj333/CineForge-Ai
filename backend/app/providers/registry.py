from typing import Dict, List, Optional

from app.core.config import settings
from app.core.exceptions import ValidationException
from app.providers.adapters.mock_provider import MockVideoProvider
from app.providers.adapters.replicate_provider import ReplicateVideoProvider
from app.providers.base import BaseVideoProvider
from app.providers.schemas import ProviderCapabilities


class ProviderRegistry:
    def __init__(self):
        self._providers: Dict[str, BaseVideoProvider] = {
            "mock": MockVideoProvider(),
            "replicate": ReplicateVideoProvider(),
        }

    def get_provider(self, provider_name: Optional[str] = None) -> BaseVideoProvider:
        name = (provider_name or settings.DEFAULT_VIDEO_PROVIDER).lower().strip()
        if name not in self._providers:
            raise ValidationException(
                f"Unknown AI video provider '{name}'. Available providers: {', '.join(self._providers.keys())}"
            )
        return self._providers[name]

    def list_capabilities(self) -> List[ProviderCapabilities]:
        return [p.get_capabilities() for p in self._providers.values()]


provider_registry = ProviderRegistry()
