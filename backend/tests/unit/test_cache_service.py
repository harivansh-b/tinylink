"""Unit tests for CacheService."""

from unittest.mock import MagicMock, patch
import json

import pytest

from app.services.cache_service import CacheService


class TestRedirectCache:
    @patch("app.services.cache_service.get_redis_client")
    def test_cache_hit(self, mock_get_client):
        mock_redis = MagicMock()
        data = {"original_url": "https://example.com", "is_active": True}
        mock_redis.get.return_value = json.dumps(data)
        mock_get_client.return_value = mock_redis

        svc = CacheService()
        result = svc.get_redirect("abc123")
        assert result == data
        mock_redis.get.assert_called_once_with("url:abc123")

    @patch("app.services.cache_service.get_redis_client")
    def test_cache_miss(self, mock_get_client):
        mock_redis = MagicMock()
        mock_redis.get.return_value = None
        mock_get_client.return_value = mock_redis

        svc = CacheService()
        result = svc.get_redirect("missing")
        assert result is None

    @patch("app.services.cache_service.get_redis_client")
    def test_set_redirect(self, mock_get_client):
        mock_redis = MagicMock()
        mock_get_client.return_value = mock_redis

        svc = CacheService()
        svc.set_redirect("abc123", {"original_url": "https://example.com"})
        mock_redis.set.assert_called_once()

    @patch("app.services.cache_service.get_redis_client")
    def test_invalidate_redirect(self, mock_get_client):
        mock_redis = MagicMock()
        mock_get_client.return_value = mock_redis

        svc = CacheService()
        svc.invalidate_redirect("abc123")
        mock_redis.delete.assert_called_once_with("url:abc123")


class TestRateLimiting:
    @patch("app.services.cache_service.get_redis_client")
    def test_under_limit(self, mock_get_client):
        mock_redis = MagicMock()
        pipe = MagicMock()
        pipe.incr.return_value = pipe
        pipe.expire.return_value = pipe
        pipe.execute.return_value = [1, True]
        mock_redis.pipeline.return_value = pipe
        mock_get_client.return_value = mock_redis

        svc = CacheService()
        assert svc.check_rate_limit("1.2.3.4") is True

    @patch("app.services.cache_service.get_redis_client")
    def test_over_limit(self, mock_get_client):
        mock_redis = MagicMock()
        pipe = MagicMock()
        pipe.incr.return_value = pipe
        pipe.expire.return_value = pipe
        pipe.execute.return_value = [101, True]
        mock_redis.pipeline.return_value = pipe
        mock_get_client.return_value = mock_redis

        svc = CacheService()
        assert svc.check_rate_limit("1.2.3.4") is False

    @patch("app.services.cache_service.get_redis_client")
    def test_redis_failure_fails_open(self, mock_get_client):
        mock_redis = MagicMock()
        mock_redis.pipeline.side_effect = Exception("connection refused")
        mock_get_client.return_value = mock_redis

        svc = CacheService()
        assert svc.check_rate_limit("1.2.3.4") is True
