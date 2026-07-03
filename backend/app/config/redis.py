"""Upstash Redis connection singleton with connection pooling and SSL."""

import logging

import redis

from app.config.settings import settings

logger = logging.getLogger(__name__)

_pool: redis.ConnectionPool | None = None


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


def get_redis_client() -> redis.Redis:
    """Return a Redis client backed by the shared pool."""
    return redis.Redis(connection_pool=get_redis_pool())


def close_redis_pool() -> None:
    """Disconnect the Redis pool (call during shutdown)."""
    global _pool
    if _pool is not None:
        _pool.disconnect()
        _pool = None
        logger.info("Redis connection pool closed")


def ping_redis() -> bool:
    """Health-check: returns True if Redis is reachable."""
    try:
        client = get_redis_client()
        return client.ping()
    except Exception:
        logger.exception("Redis ping failed")
        return False
