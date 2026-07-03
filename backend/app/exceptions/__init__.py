"""Custom domain exceptions for TinyLink."""


class TinyLinkError(Exception):
    """Base exception for all TinyLink errors."""


class UnauthorizedError(TinyLinkError):
    """Raised when a user is not authenticated or lacks permission."""

    def __init__(self, message: str = "Unauthorized") -> None:
        super().__init__(message)
        self.message = message


class NotFoundError(TinyLinkError):
    """Raised when a requested resource does not exist."""

    def __init__(self, resource: str = "Resource") -> None:
        super().__init__(f"{resource} not found")
        self.message = f"{resource} not found"


class AliasAlreadyExistsError(TinyLinkError):
    """Raised when a custom alias is already taken."""

    def __init__(self, alias: str) -> None:
        super().__init__(f"Alias '{alias}' is already taken")
        self.message = f"Alias '{alias}' is already taken"


class URLExpiredError(TinyLinkError):
    """Raised when a short URL has expired."""

    def __init__(self) -> None:
        super().__init__("This link has expired")
        self.message = "This link has expired"


class InactiveURLError(TinyLinkError):
    """Raised when a short URL is inactive."""

    def __init__(self) -> None:
        super().__init__("This link is inactive")
        self.message = "This link is inactive"


class ValidationError(TinyLinkError):
    """Raised when input validation fails."""

    def __init__(self, message: str) -> None:
        super().__init__(message)
        self.message = message


class RateLimitError(TinyLinkError):
    """Raised when rate limit is exceeded."""

    def __init__(self) -> None:
        super().__init__("Rate limit exceeded. Try again later.")
        self.message = "Rate limit exceeded. Try again later."
