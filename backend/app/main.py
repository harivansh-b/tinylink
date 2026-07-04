"""TinyLink — FastAPI application entry point."""

import logging
from contextlib import asynccontextmanager
from collections.abc import AsyncGenerator

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from strawberry.fastapi import GraphQLRouter

from app.auth.clerk import verify_clerk_token
from app.config.redis import close_redis_pool
from app.config.settings import settings
from app.graphql.context import GraphQLContext
from app.graphql.schema import schema
from app.middleware.exception_handler import ExceptionHandlerMiddleware
from app.middleware.logging import RequestLoggingMiddleware
from app.middleware.rate_limit import RateLimitMiddleware

# ─── Logging ──────────────────────────────────────────────────────────────────


logging.basicConfig(
    level=logging.INFO if settings.is_production else logging.DEBUG,
    format="%(asctime)s %(levelname)-8s [%(name)s] %(message)s",
)
logger = logging.getLogger(__name__)


# ─── Lifespan ─────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Startup / shutdown events."""
    logger.info("TinyLink starting up (env=%s)", settings.APP_ENV)
    yield
    close_redis_pool()
    logger.info("TinyLink shut down")


# ─── GraphQL context ─────────────────────────────────────────────────────────

async def get_context(request: Request) -> GraphQLContext:
    """Build the Strawberry GraphQL context for each request."""
    from app.db.session import SessionLocal
    from app.services.user import UserService

    # Use SessionLocal directly so we control commit / rollback fully.
    # The previous pattern `next(get_db())` leaked the generator — the
    # generator's `finally: db.close()` block never ran, so flush() writes
    # were rolled back on garbage collection and new users were never saved.
    db = SessionLocal()

    current_user = None
    auth_header = request.headers.get("authorization", "")
    logger.debug(
        "GraphQL request auth_header_present=%s path=%s",
        bool(auth_header),
        request.url.path,
    )

    if auth_header.startswith("Bearer "):
        token = auth_header.removeprefix("Bearer ").strip()
        try:
            payload = await verify_clerk_token(token)
            clerk_id: str = payload["sub"]

            # Check for frontend-provided headers verified by the JWT sub claim
            header_email = request.headers.get("x-clerk-email", "")
            header_display_name = request.headers.get("x-clerk-display-name", "")

            # Clerk's default session token only contains sub/iss/exp.
            # Email / name are only present with a custom JWT template.
            # Use X-Clerk-Email header as primary source, then fallback to payload,
            # and finally to placeholder.
            email: str = (
                header_email
                or payload.get("email")
                or payload.get("email_address")
                or f"{clerk_id}@clerk.local"
            )
            first_name: str = payload.get("first_name") or ""
            last_name: str = payload.get("last_name") or ""
            display_name: str | None = (
                header_display_name
                or f"{first_name} {last_name}".strip()
                or None
            )

            svc = UserService(db)
            user = svc.find_or_create(
                clerk_id=clerk_id,
                email=email,
                display_name=display_name,
            )

            # If user's details changed (e.g. from placeholder email to actual email),
            # update the user profile in DB dynamically
            if user.email != email or (display_name and user.display_name != display_name):
                user = svc.update_profile(
                    user,
                    email=email if email else None,
                    display_name=display_name if display_name else None,
                )

            db.commit()       # persist new user rows immediately
            db.refresh(user)  # reload after commit so relationships are fresh

            if not user.is_deleted:
                current_user = user
                logger.debug(
                    "Authenticated clerk_id=%s user_id=%s", clerk_id, user.id
                )

        except Exception as exc:
            db.rollback()
            logger.warning(
                "Auth failed for %s %s: %s",
                request.method,
                request.url.path,
                exc,
            )

    return GraphQLContext(db=db, request=request, current_user=current_user)


# ─── App ──────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="TinyLink API",
    version="1.0.0",
    description="Production-quality SaaS URL shortener",
    lifespan=lifespan,
)

# Middleware (order matters: outermost runs first)
app.add_middleware(RateLimitMiddleware)
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(ExceptionHandlerMiddleware)

cors_origins = [
    origin.strip()
    for origin in settings.CORS_ALLOWED_ORIGINS.split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── GraphQL ──────────────────────────────────────────────────────────────────

graphql_router = GraphQLRouter(
    schema,
    context_getter=get_context,
    graphql_ide="graphiql" if settings.GRAPHQL_DEBUG else None,
)
app.include_router(graphql_router, prefix="/graphql")

# ─── REST endpoints ──────────────────────────────────────────────────────────

from app.api.health import router as health_router
from app.api.webhooks import router as webhook_router
from app.api.redirect import router as redirect_router

# Health and webhooks must come BEFORE the catch-all redirect
app.include_router(health_router, tags=["Health"])
app.include_router(webhook_router, tags=["Webhooks"])
# Redirect is the catch-all and must be LAST
app.include_router(redirect_router, tags=["Redirect"])