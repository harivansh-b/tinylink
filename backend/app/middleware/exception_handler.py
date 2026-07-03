"""Global exception handler middleware."""

import logging

from fastapi import Request, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import Response

from app.exceptions import (
    AliasAlreadyExistsError,
    InactiveURLError,
    NotFoundError,
    RateLimitError,
    TinyLinkError,
    URLExpiredError,
    UnauthorizedError,
    ValidationError,
)

logger = logging.getLogger(__name__)

_STATUS_MAP: dict[type, int] = {
    UnauthorizedError: status.HTTP_401_UNAUTHORIZED,
    NotFoundError: status.HTTP_404_NOT_FOUND,
    AliasAlreadyExistsError: status.HTTP_409_CONFLICT,
    URLExpiredError: status.HTTP_410_GONE,
    InactiveURLError: status.HTTP_404_NOT_FOUND,
    ValidationError: status.HTTP_422_UNPROCESSABLE_ENTITY,
    RateLimitError: status.HTTP_429_TOO_MANY_REQUESTS,
}


class ExceptionHandlerMiddleware(BaseHTTPMiddleware):
    """Catch domain exceptions and convert to JSON HTTP responses."""

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        try:
            return await call_next(request)
        except TinyLinkError as exc:
            code = _STATUS_MAP.get(type(exc), status.HTTP_400_BAD_REQUEST)
            logger.warning("Domain error [%d]: %s", code, exc.message)
            return JSONResponse(
                status_code=code,
                content={"detail": exc.message},
            )
        except Exception:
            logger.exception("Unhandled exception")
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={"detail": "Internal server error"},
            )
