"""REST endpoint: GET /health — health check."""

from fastapi import APIRouter
from sqlalchemy import text

from app.config.redis import ping_redis
from app.db.dependencies import get_db

router = APIRouter()


@router.get("/health")
def health_check() -> dict[str, str]:
    """
    Health check endpoint.

    Returns database and Redis connectivity status.
    """
    # Database check
    db_status = "disconnected"
    try:
        db = next(get_db())
        try:
            db.execute(text("SELECT 1"))
            db_status = "connected"
        finally:
            db.close()
    except Exception:
        pass

    # Redis check
    redis_status = "connected" if ping_redis() else "disconnected"

    overall = "ok" if db_status == "connected" and redis_status == "connected" else "degraded"

    return {
        "status": overall,
        "database": db_status,
        "redis": redis_status,
    }
