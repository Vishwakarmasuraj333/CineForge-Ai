from typing import Any, Optional


class CineForgeException(Exception):
    """Base exception for all CineForge errors."""
    def __init__(self, message: str, code: str = "INTERNAL_ERROR", details: Optional[Any] = None):
        self.message = message
        self.code = code
        self.details = details
        super().__init__(message)


class EntityNotFoundException(CineForgeException):
    def __init__(self, entity_name: str, identifier: Any):
        super().__init__(
            message=f"{entity_name} with identifier '{identifier}' was not found.",
            code="NOT_FOUND",
            details={"entity": entity_name, "identifier": str(identifier)}
        )


class AccessForbiddenException(CineForgeException):
    def __init__(self, message: str = "Access forbidden to requested resource."):
        super().__init__(message=message, code="FORBIDDEN")


class AuthenticationException(CineForgeException):
    def __init__(self, message: str = "Invalid authentication credentials."):
        super().__init__(message=message, code="UNAUTHORIZED")


class ProviderException(CineForgeException):
    def __init__(self, provider_name: str, message: str, safe_message: Optional[str] = None):
        super().__init__(
            message=f"Provider '{provider_name}' error: {message}",
            code="PROVIDER_ERROR",
            details={"provider": provider_name, "safe_message": safe_message or "External AI provider encountered an error."}
        )


class QuotaExceededException(CineForgeException):
    def __init__(self, message: str = "User generation quota exceeded."):
        super().__init__(message=message, code="QUOTA_EXCEEDED")


class ValidationException(CineForgeException):
    def __init__(self, message: str, details: Optional[Any] = None):
        super().__init__(message=message, code="VALIDATION_ERROR", details=details)

