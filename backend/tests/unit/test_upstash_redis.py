"""Unit tests for UpstashRedisClient and UpstashPipeline."""

from unittest.mock import MagicMock, patch

import pytest

from app.config.redis import UpstashRedisClient


class TestUpstashRedisClient:
    @patch("app.config.redis.httpx.Client")
    def test_ping_success(self, mock_client_cls):
        mock_http = MagicMock()
        mock_resp = MagicMock()
        mock_resp.json.return_value = {"result": "PONG"}
        mock_http.post.return_value = mock_resp
        mock_client_cls.return_value = mock_http

        client = UpstashRedisClient("https://upstash.io", "token123")
        assert client.ping() is True
        mock_http.post.assert_called_once_with(
            "https://upstash.io",
            headers={"Authorization": "Bearer token123"},
            json=["PING"],
        )

    @patch("app.config.redis.httpx.Client")
    def test_ping_failed(self, mock_client_cls):
        mock_http = MagicMock()
        mock_http.post.side_effect = Exception("HTTP error")
        mock_client_cls.return_value = mock_http

        client = UpstashRedisClient("https://upstash.io", "token123")
        assert client.ping() is False

    @patch("app.config.redis.httpx.Client")
    def test_get_and_set(self, mock_client_cls):
        mock_http = MagicMock()
        mock_resp_set = MagicMock()
        mock_resp_set.json.return_value = {"result": "OK"}
        mock_resp_get = MagicMock()
        mock_resp_get.json.return_value = {"result": "val1"}
        mock_http.post.side_effect = [mock_resp_set, mock_resp_get]
        mock_client_cls.return_value = mock_http

        client = UpstashRedisClient("https://upstash.io", "token123")
        assert client.set("k1", "val1", ex=10) is True
        assert client.get("k1") == "val1"

        mock_http.post.assert_any_call(
            "https://upstash.io",
            headers={"Authorization": "Bearer token123"},
            json=["SET", "k1", "val1", "EX", "10"],
        )
        mock_http.post.assert_any_call(
            "https://upstash.io",
            headers={"Authorization": "Bearer token123"},
            json=["GET", "k1"],
        )

    @patch("app.config.redis.httpx.Client")
    def test_delete_and_incr(self, mock_client_cls):
        mock_http = MagicMock()
        mock_resp_del = MagicMock()
        mock_resp_del.json.return_value = {"result": 1}
        mock_resp_incr = MagicMock()
        mock_resp_incr.json.return_value = {"result": 5}
        mock_http.post.side_effect = [mock_resp_del, mock_resp_incr]
        mock_client_cls.return_value = mock_http

        client = UpstashRedisClient("https://upstash.io", "token123")
        assert client.delete("k1") == 1
        assert client.incr("counter") == 5

    @patch("app.config.redis.httpx.Client")
    def test_pipeline(self, mock_client_cls):
        mock_http = MagicMock()
        mock_resp = MagicMock()
        # Pipeline response structure from Upstash REST
        mock_resp.json.return_value = [{"result": 10}, {"result": True}]
        mock_http.post.return_value = mock_resp
        mock_client_cls.return_value = mock_http

        client = UpstashRedisClient("https://upstash.io", "token123")
        pipe = client.pipeline()
        pipe.incr("c1").expire("c1", 60)
        res = pipe.execute()

        assert res == [10, True]
        mock_http.post.assert_called_once_with(
            "https://upstash.io/pipeline",
            headers={"Authorization": "Bearer token123"},
            json=[["INCR", "c1"], ["EXPIRE", "c1", 60]],
            timeout=5.0,
        )
