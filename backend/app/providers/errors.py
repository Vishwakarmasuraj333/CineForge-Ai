from typing import Optional


class ProviderError(Exception):
    def __init__(self, message: str, provider_name: str, status_code: Optional[int] = None):
        self.message = message
        self.provider_name = provider_name
        self.status_code = status_code
        super().__init__(f"[{provider_name}] {message}")


class ProviderAuthError(ProviderError):
    pass


class ProviderRateLimitError(ProviderError):
    pass


class ProviderInsufficientCreditError(ProviderError):
    pass


class ProviderJobFailedError(ProviderError):
    pass

