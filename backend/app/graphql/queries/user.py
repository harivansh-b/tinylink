"""GraphQL queries for user."""

import logging
import threading
from datetime import datetime, timezone

import strawberry
from strawberry.types import Info

from app.exceptions import UnauthorizedError
from app.graphql.context import GraphQLContext
from app.graphql.types.user import UserType
from app.models.user import Plan
from app.services import email_service

logger = logging.getLogger(__name__)


@strawberry.type
class UserQuery:
    @strawberry.field
    def me(self, info: Info[GraphQLContext, None]) -> UserType:
        """Return the currently authenticated user, auto-expiring paid plans."""
        user = info.context.current_user
        if user is None:
            raise UnauthorizedError("Authentication required")

        # ── Auto-expire paid plan if plan_expires_at has passed ──────────────
        if (
            user.plan != Plan.free
            and user.plan_expires_at is not None
        ):
            now = datetime.now(timezone.utc)
            exp = user.plan_expires_at
            if exp.tzinfo is None:
                exp = exp.replace(tzinfo=timezone.utc)
            if exp <= now:
                expired_plan = user.plan.value
                expired_at_str = exp.strftime("%d %b %Y, %H:%M UTC")
                # Downgrade in DB
                try:
                    db = info.context.db
                    user.plan = Plan.free
                    user.plan_expires_at = None
                    db.commit()
                    db.refresh(user)
                    logger.info(
                        "Auto-downgraded user_id=%s from plan=%s (expired %s)",
                        user.id, expired_plan, expired_at_str,
                    )
                    # Fire expiry email best-effort
                    threading.Thread(
                        target=email_service.send_plan_expiry_email,
                        kwargs={
                            "email":      user.email,
                            "name":       user.display_name or "",
                            "plan":       expired_plan,
                            "expired_at": expired_at_str,
                        },
                        daemon=True,
                    ).start()
                except Exception as exc:  # noqa: BLE001
                    logger.warning("Plan auto-expiry failed: %s", exc)

        return UserType(
            id=user.id,
            email=user.email,
            display_name=user.display_name,
            created_at=user.created_at,
            updated_at=user.updated_at,
            plan=user.plan.value if hasattr(user.plan, "value") else str(user.plan),
            plan_expires_at=user.plan_expires_at,
        )

