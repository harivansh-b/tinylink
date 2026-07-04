"""Rate limiting middleware using Upstash/Redis cache service."""

import logging

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import Response

from app.config.settings import settings
from app.exceptions import RateLimitError
from app.services.cache_service import CacheService

logger = logging.getLogger(__name__)


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Enforces rate limiting on all requests except health-checks and webhooks."""

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        path = request.url.path

        # Bypass rate limit for health endpoints and webhooks
        if path.startswith("/health") or path.startswith("/api/webhooks"):
            return await call_next(request)

        # Retrieve client IP
        client_ip = request.client.host if request.client else "unknown"

        # Check rate limit
        cache = CacheService()
        if not cache.check_rate_limit(client_ip, settings.RATE_LIMIT_PER_MINUTE):
            raise RateLimitError()

        return await call_next(request)
