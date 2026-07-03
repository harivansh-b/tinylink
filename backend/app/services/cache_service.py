"""CacheService — all Redis caching logic for TinyLink.

Repositories only talk to PostgreSQL.
Services use this CacheService for all Redis interactions.
"""

import json
import logging
from typing import Any

import redis

from app.config.redis import get_redis_client

logger = logging.getLogger(__name__)

# TTLs
REDIRECT_TTL = 86400       # 24 hours
DASHBOARD_TTL = 600         # 10 minutes
ANALYTICS_TTL = 300         # 5 minutes
RATE_LIMIT_WINDOW = 60      # 1 minute


class CacheService:
    """Centralised caching layer backed by Upstash Redis."""

    def __init__(self) -> None:
        self._r: redis.Redis = get_redis_client()

    # ─── Redirect cache ──────────────────────────────────────────────────

    def get_redirect(self, short_code: str) -> dict[str, Any] | None:
        key = f"url:{short_code}"
        try:
            raw = self._r.get(key)
            if raw:
                logger.debug("Cache HIT for redirect %s", short_code)
                return json.loads(raw)
            logger.debug("Cache MISS for redirect %s", short_code)
        except Exception:
            logger.exception("Redis error getting redirect cache %s", short_code)
        return None

    def set_redirect(self, short_code: str, data: dict[str, Any]) -> None:
        key = f"url:{short_code}"
        try:
            self._r.set(key, json.dumps(data, default=str), ex=REDIRECT_TTL)
            logger.debug("Cached redirect %s (TTL=%ds)", short_code, REDIRECT_TTL)
        except Exception:
            logger.exception("Redis error setting redirect cache %s", short_code)

    def invalidate_redirect(self, short_code: str) -> None:
        key = f"url:{short_code}"
        try:
            self._r.delete(key)
            logger.info("Invalidated redirect cache for %s", short_code)
        except Exception:
            logger.exception("Redis error invalidating redirect %s", short_code)

    # ─── Dashboard cache ─────────────────────────────────────────────────

    def get_dashboard(self, user_id: str) -> dict[str, Any] | None:
        key = f"dashboard:{user_id}"
        try:
            raw = self._r.get(key)
            if raw:
                logger.debug("Cache HIT for dashboard %s", user_id)
                return json.loads(raw)
            logger.debug("Cache MISS for dashboard %s", user_id)
        except Exception:
            logger.exception("Redis error getting dashboard cache %s", user_id)
        return None

    def set_dashboard(self, user_id: str, data: dict[str, Any]) -> None:
        key = f"dashboard:{user_id}"
        try:
            self._r.set(key, json.dumps(data, default=str), ex=DASHBOARD_TTL)
        except Exception:
            logger.exception("Redis error setting dashboard cache %s", user_id)

    def invalidate_dashboard(self, user_id: str) -> None:
        key = f"dashboard:{user_id}"
        try:
            self._r.delete(key)
        except Exception:
            logger.exception("Redis error invalidating dashboard %s", user_id)

    # ─── Analytics cache ─────────────────────────────────────────────────

    def get_analytics(self, url_id: str) -> dict[str, Any] | None:
        key = f"analytics:{url_id}"
        try:
            raw = self._r.get(key)
            if raw:
                logger.debug("Cache HIT for analytics %s", url_id)
                return json.loads(raw)
            logger.debug("Cache MISS for analytics %s", url_id)
        except Exception:
            logger.exception("Redis error getting analytics cache %s", url_id)
        return None

    def set_analytics(self, url_id: str, data: dict[str, Any]) -> None:
        key = f"analytics:{url_id}"
        try:
            self._r.set(key, json.dumps(data, default=str), ex=ANALYTICS_TTL)
        except Exception:
            logger.exception("Redis error setting analytics cache %s", url_id)

    def invalidate_analytics(self, url_id: str) -> None:
        key = f"analytics:{url_id}"
        try:
            self._r.delete(key)
        except Exception:
            logger.exception("Redis error invalidating analytics %s", url_id)

    # ─── Rate limiting ───────────────────────────────────────────────────

    def check_rate_limit(self, ip: str, limit: int = 100) -> bool:
        """
        Sliding-window rate limiter per IP.
        Returns True if the request is ALLOWED, False if rate-limited.
        """
        key = f"rate:{ip}"
        try:
            pipe = self._r.pipeline(transaction=True)
            pipe.incr(key)
            pipe.expire(key, RATE_LIMIT_WINDOW)
            results = pipe.execute()
            count = results[0]
            allowed = count <= limit
            if not allowed:
                logger.warning("Rate limit exceeded for IP %s (count=%d)", ip, count)
            return allowed
        except Exception:
            logger.exception("Redis rate-limit check failed for %s", ip)
            return True  # fail open
