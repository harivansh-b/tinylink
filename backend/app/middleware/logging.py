"""Request logging middleware."""

import logging
import time
from uuid import uuid4

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

logger = logging.getLogger("tinylink.access")


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Log every HTTP request with timing, path, and status."""

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        request_id = str(uuid4())[:8]
        start = time.perf_counter()

        # Attach request_id to state for downstream use
        request.state.request_id = request_id

        response: Response | None = None
        try:
            response = await call_next(request)
            return response
        finally:
            elapsed_ms = (time.perf_counter() - start) * 1000
            status_code = response.status_code if response else 500
            logger.info(
                "[%s] %s %s → %d (%.1fms)",
                request_id,
                request.method,
                request.url.path,
                status_code,
                elapsed_ms,
            )
