"""REST endpoint: POST /webhooks/clerk — Clerk webhook handler."""

import logging

from fastapi import APIRouter, HTTPException, Request, status
from svix.webhooks import Webhook, WebhookVerificationError

from app.config.settings import settings
from app.db.dependencies import get_db
from app.services.user import UserService

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/webhooks/clerk")
async def clerk_webhook(request: Request) -> dict[str, str]:
    """
    Handle Clerk webhook events.

    Verifies the Svix signature and processes:
    - user.created
    - user.updated
    - user.deleted
    """
    body = await request.body()
    headers = dict(request.headers)

    # Verify Svix signature
    if not settings.CLERK_WEBHOOK_SECRET:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Webhook secret not configured",
        )

    try:
        wh = Webhook(settings.CLERK_WEBHOOK_SECRET)
        payload = wh.verify(body, headers)
    except WebhookVerificationError as exc:
        logger.warning("Webhook signature verification failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid webhook signature",
        ) from exc

    event_type: str = payload.get("type", "")
    data: dict = payload.get("data", {})

    logger.info("Received Clerk webhook: %s", event_type)

    db = next(get_db())
    try:
        svc = UserService(db)

        if event_type == "user.created":
            _handle_user_created(svc, data)
        elif event_type == "user.updated":
            _handle_user_updated(svc, data)
        elif event_type == "user.deleted":
            _handle_user_deleted(svc, data)
        else:
            logger.debug("Ignoring unhandled webhook event: %s", event_type)

        db.commit()
    except Exception:
        db.rollback()
        logger.exception("Error processing webhook %s", event_type)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
    finally:
        db.close()

    return {"status": "ok"}


def _handle_user_created(svc: UserService, data: dict) -> None:
    """Handle user.created event."""
    clerk_id = data.get("id", "")
    email = _extract_primary_email(data)
    display_name = _extract_display_name(data)

    if clerk_id and email:
        svc.sync_from_webhook(clerk_id=clerk_id, email=email, display_name=display_name)
        logger.info("Webhook: created user %s", clerk_id)


def _handle_user_updated(svc: UserService, data: dict) -> None:
    """Handle user.updated event."""
    clerk_id = data.get("id", "")
    email = _extract_primary_email(data)
    display_name = _extract_display_name(data)

    if clerk_id and email:
        svc.sync_from_webhook(clerk_id=clerk_id, email=email, display_name=display_name)
        logger.info("Webhook: updated user %s", clerk_id)


def _handle_user_deleted(svc: UserService, data: dict) -> None:
    """Handle user.deleted event."""
    clerk_id = data.get("id", "")
    if clerk_id:
        svc.soft_delete(clerk_id)
        logger.info("Webhook: soft-deleted user %s", clerk_id)


def _extract_primary_email(data: dict) -> str:
    """Extract the primary email from Clerk webhook data."""
    email_addresses = data.get("email_addresses", [])
    primary_id = data.get("primary_email_address_id")

    for ea in email_addresses:
        if ea.get("id") == primary_id:
            return ea.get("email_address", "")

    # Fallback to first email
    if email_addresses:
        return email_addresses[0].get("email_address", "")
    return ""


def _extract_display_name(data: dict) -> str | None:
    """Extract display name from Clerk webhook data."""
    first = data.get("first_name", "")
    last = data.get("last_name", "")
    full = f"{first} {last}".strip()
    return full if full else None
