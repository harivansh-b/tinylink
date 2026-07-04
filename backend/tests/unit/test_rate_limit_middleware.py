"""Unit/integration tests for RateLimitMiddleware."""

from unittest.mock import MagicMock, patch

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.exceptions import RateLimitError
from app.middleware.exception_handler import ExceptionHandlerMiddleware
from app.middleware.rate_limit import RateLimitMiddleware


def test_rate_limit_middleware_under_limit():
    app = FastAPI()
    app.add_middleware(RateLimitMiddleware)
    app.add_middleware(ExceptionHandlerMiddleware)

    @app.get("/test-route")
    def test_route():
        return {"status": "ok"}

    client = TestClient(app)

    with patch("app.middleware.rate_limit.CacheService") as mock_cache_cls:
        mock_cache = MagicMock()
        mock_cache.check_rate_limit.return_value = True
        mock_cache_cls.return_value = mock_cache

        response = client.get("/test-route")
        assert response.status_code == 200
        assert response.json() == {"status": "ok"}
        mock_cache.check_rate_limit.assert_called_once_with("testclient", 100)


def test_rate_limit_middleware_over_limit():
    app = FastAPI()
    app.add_middleware(RateLimitMiddleware)
    app.add_middleware(ExceptionHandlerMiddleware)

    @app.get("/test-route")
    def test_route():
        return {"status": "ok"}

    client = TestClient(app)

    with patch("app.middleware.rate_limit.CacheService") as mock_cache_cls:
        mock_cache = MagicMock()
        # Mock rate limit exceeded
        mock_cache.check_rate_limit.return_value = False
        mock_cache_cls.return_value = mock_cache

        response = client.get("/test-route")
        assert response.status_code == 429
        assert response.json() == {"detail": "Rate limit exceeded. Try again later."}


def test_rate_limit_middleware_bypass_health_and_webhooks():
    app = FastAPI()
    app.add_middleware(RateLimitMiddleware)
    app.add_middleware(ExceptionHandlerMiddleware)

    @app.get("/healthz")
    def health():
        return {"status": "healthy"}

    @app.post("/api/webhooks/clerk")
    def webhook():
        return {"status": "received"}

    client = TestClient(app)

    with patch("app.middleware.rate_limit.CacheService") as mock_cache_cls:
        mock_cache = MagicMock()
        mock_cache_cls.return_value = mock_cache

        # These endpoints should bypass rate limiting entirely
        resp_health = client.get("/healthz")
        assert resp_health.status_code == 200
        assert resp_health.json() == {"status": "healthy"}

        resp_webhook = client.post("/api/webhooks/clerk")
        assert resp_webhook.status_code == 200
        assert resp_webhook.json() == {"status": "received"}

        # check_rate_limit should NOT have been called for these routes
        mock_cache.check_rate_limit.assert_not_called()
