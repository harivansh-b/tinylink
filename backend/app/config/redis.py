"""Upstash Redis connection singleton with connection pooling and SSL."""

import logging
from typing import Any, List, Optional, Union

import httpx
import redis

from app.config.settings import settings

logger = logging.getLogger(__name__)

_pool: redis.ConnectionPool | None = None
_upstash_client: "UpstashRedisClient | None" = None


class UpstashPipeline:
    """Mock-like pipeline for Upstash HTTP REST commands."""

    def __init__(self, client: "UpstashRedisClient"):
        self.client = client
        self.commands: List[List[Any]] = []

    def incr(self, key: str) -> "UpstashPipeline":
        self.commands.append(["INCR", key])
        return self

    def expire(self, key: str, time: int) -> "UpstashPipeline":
        self.commands.append(["EXPIRE", key, time])
        return self

    def execute(self) -> List[Any]:
        if not self.commands:
            return []
        try:
            url = f"{self.client.url}/pipeline"
            headers = {"Authorization": f"Bearer {self.client.token}"}
            # Upstash batch pipeline endpoint uses POST with a JSON list of commands
            response = self.client.http_client.post(
                url, headers=headers, json=self.commands, timeout=5.0
            )
            response.raise_for_status()
            res = response.json()
            # Upstash returns a list of dictionaries: [{'result': ...}, {'error': ...}]
            # We map this to a list of values to match redis-py format
            output = []
            for item in res:
                if "error" in item:
                    raise Exception(item["error"])
                output.append(item.get("result"))
            return output
        except Exception as exc:
            logger.exception("Upstash Redis pipeline execution failed")
            raise exc


class UpstashRedisClient:
    """HTTP client wrapper for Upstash Redis REST API."""

    def __init__(self, url: str, token: str):
        self.url = url.rstrip("/")
        self.token = token
        # Use a single httpx Client for pooling
        self.http_client = httpx.Client(
            timeout=5.0,
            limits=httpx.Limits(max_keepalive_connections=20, max_connections=50),
        )

    def close(self) -> None:
        self.http_client.close()

    def ping(self) -> bool:
        try:
            url = self.url
            headers = {"Authorization": f"Bearer {self.token}"}
            response = self.http_client.post(url, headers=headers, json=["PING"])
            response.raise_for_status()
            return response.json().get("result") == "PONG"
        except Exception:
            return False

    def get(self, key: str) -> Optional[str]:
        url = self.url
        headers = {"Authorization": f"Bearer {self.token}"}
        response = self.http_client.post(url, headers=headers, json=["GET", key])
        response.raise_for_status()
        return response.json().get("result")

    def set(self, key: str, value: str, ex: Optional[int] = None) -> bool:
        url = self.url
        headers = {"Authorization": f"Bearer {self.token}"}
        cmd = ["SET", key, value]
        if ex is not None:
            cmd.extend(["EX", str(ex)])
        response = self.http_client.post(url, headers=headers, json=cmd)
        response.raise_for_status()
        return response.json().get("result") == "OK"

    def delete(self, key: str) -> int:
        url = self.url
        headers = {"Authorization": f"Bearer {self.token}"}
        response = self.http_client.post(url, headers=headers, json=["DEL", key])
        response.raise_for_status()
        res = response.json().get("result")
        return int(res) if res is not None else 0

    def incr(self, key: str) -> int:
        url = self.url
        headers = {"Authorization": f"Bearer {self.token}"}
        response = self.http_client.post(url, headers=headers, json=["INCR", key])
        response.raise_for_status()
        res = response.json().get("result")
        return int(res) if res is not None else 0

    def expire(self, key: str, time: int) -> bool:
        url = self.url
        headers = {"Authorization": f"Bearer {self.token}"}
        response = self.http_client.post(
            url, headers=headers, json=["EXPIRE", key, str(time)]
        )
        response.raise_for_status()
        return bool(response.json().get("result"))

    def pipeline(self, transaction: bool = True) -> UpstashPipeline:
        return UpstashPipeline(self)


def get_redis_pool() -> redis.ConnectionPool:
    """Return the shared Redis connection pool (lazy-initialised)."""
    global _pool
    if _pool is None:
        _pool = redis.ConnectionPool.from_url(
            settings.REDIS_URL,
            decode_responses=True,
            max_connections=20,
            socket_timeout=5,
            socket_connect_timeout=5,
            retry_on_timeout=True,
            health_check_interval=30,
            protocol=2,  # Force RESP2 — avoids "unknown command HELLO 3" on older Redis
        )
        logger.info("Redis connection pool created")
    return _pool


def get_redis_client() -> Union[redis.Redis, UpstashRedisClient]:
    """Return a Redis client, defaulting to Upstash HTTP REST if configured."""
    global _upstash_client
    if settings.UPSTASH_REDIS_REST_URL and settings.UPSTASH_REDIS_REST_TOKEN:
        if _upstash_client is None:
            _upstash_client = UpstashRedisClient(
                settings.UPSTASH_REDIS_REST_URL, settings.UPSTASH_REDIS_REST_TOKEN
            )
            logger.info("Upstash Redis HTTP client initialized")
        return _upstash_client
    return redis.Redis(connection_pool=get_redis_pool())


def close_redis_pool() -> None:
    """Disconnect the Redis pool or close Upstash HTTP client (call during shutdown)."""
    global _pool, _upstash_client
    if _pool is not None:
        _pool.disconnect()
        _pool = None
        logger.info("Redis connection pool closed")
    if _upstash_client is not None:
        _upstash_client.close()
        _upstash_client = None
        logger.info("Upstash Redis HTTP client closed")


def ping_redis() -> bool:
    """Health-check: returns True if Redis is reachable."""
    try:
        client = get_redis_client()
        return client.ping()
    except Exception:
        logger.exception("Redis ping failed")
        return False

