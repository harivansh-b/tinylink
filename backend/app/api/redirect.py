"""REST endpoint: GET /{shortCode} — redirect with Redis cache."""

import logging

from fastapi import APIRouter, HTTPException, Request, status
from fastapi.responses import RedirectResponse

from app.db.dependencies import get_db
from app.config.settings import settings
from app.repositories.click import ClickRepository
from app.repositories.url import ShortURLRepository
from app.services.cache_service import CacheService
from app.utils.user_agent import parse_user_agent

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/{short_code}")
def redirect(short_code: str, request: Request) -> RedirectResponse:
    """
    Redirect a short code to the original URL.

    Flow: Redis cache → PostgreSQL → validate → cache → log click → 301 redirect
    """
    cache = CacheService()

    # Rate limiting
    client_ip = request.client.host if request.client else "unknown"
    if not cache.check_rate_limit(client_ip, settings.RATE_LIMIT_PER_MINUTE):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Try again later.",
        )

    # 1. Try Redis cache
    cached = cache.get_redirect(short_code)
    if cached:
        # Validate cached data
        import json
        from datetime import datetime, timezone

        if not cached.get("is_active", True):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Link is inactive")

        expires_at = cached.get("expires_at")
        if expires_at:
            try:
                exp_dt = datetime.fromisoformat(str(expires_at))
                if exp_dt.tzinfo is None:
                    exp_dt = exp_dt.replace(tzinfo=timezone.utc)
                if exp_dt <= datetime.now(timezone.utc):
                    raise HTTPException(status_code=status.HTTP_410_GONE, detail="Link has expired")
            except (ValueError, TypeError):
                pass

        # Record click asynchronously (best effort in sync context)
        _record_click(cached.get("url_id"), request)

        return RedirectResponse(
            url=cached["original_url"],
            status_code=status.HTTP_301_MOVED_PERMANENTLY,
        )

    # 2. Database lookup
    db = next(get_db())
    try:
        repo = ShortURLRepository(db)
        url = repo.find_by_short_code(short_code)

        if url is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Short URL not found")

        if not url.is_active:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Link is inactive")

        # Check expiry
        if url.expires_at is not None:
            from datetime import datetime, timezone
            exp = url.expires_at
            if exp.tzinfo is None:
                exp = exp.replace(tzinfo=timezone.utc)
            if exp <= datetime.now(timezone.utc):
                raise HTTPException(status_code=status.HTTP_410_GONE, detail="Link has expired")

        # 3. Cache in Redis
        cache_data = {
            "original_url": url.original_url,
            "expires_at": url.expires_at.isoformat() if url.expires_at else None,
            "is_active": url.is_active,
            "url_id": str(url.id),
        }
        cache.set_redirect(short_code, cache_data)

        # 4. Increment click count
        repo.increment_clicks(url.id)

        # 5. Record click analytics
        _record_click_db(db, url.id, request)

        db.commit()

        logger.info("Redirect %s → %s", short_code, url.original_url)

        return RedirectResponse(
            url=url.original_url,
            status_code=status.HTTP_301_MOVED_PERMANENTLY,
        )
    except HTTPException:
        raise
    except Exception:
        logger.exception("Error during redirect for %s", short_code)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
    finally:
        db.close()


def _record_click(url_id_str: str | None, request: Request) -> None:
    """Best-effort click recording (runs in sync context)."""
    if not url_id_str:
        return
    try:
        from uuid import UUID
        url_id = UUID(url_id_str)
        db = next(get_db())
        try:
            _record_click_db(db, url_id, request)
            # Also increment click count
            repo = ShortURLRepository(db)
            repo.increment_clicks(url_id)
            db.commit()
            # Invalidate analytics cache
            CacheService().invalidate_analytics(url_id_str)
        finally:
            db.close()
    except Exception:
        logger.exception("Failed to record click for %s", url_id_str)


def _record_click_db(db: object, url_id: object, request: Request) -> None:
    """Insert a click record into the database."""
    from uuid import UUID as UUIDType
    from sqlalchemy.orm import Session

    ua_str = request.headers.get("user-agent")
    ua = parse_user_agent(ua_str)

    # Get country from headers (e.g. from CDN/proxy)
    country = (
        request.headers.get("cf-ipcountry")
        or request.headers.get("x-vercel-ip-country")
        or None
    )

    repo = ClickRepository(db)  # type: ignore[arg-type]
    repo.create(
        url_id=url_id,  # type: ignore[arg-type]
        ip_address=request.client.host if request.client else None,
        browser=ua.get("browser"),
        device=ua.get("device"),
        country=country,
        referer=request.headers.get("referer"),
    )
