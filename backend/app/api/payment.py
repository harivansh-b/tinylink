"""Payment REST API — Razorpay checkout endpoints.

POST /api/payment/order    — create a Razorpay order for a plan
POST /api/payment/verify   — verify signature, upgrade user plan, send email
GET  /api/payment/plans    — return plan catalogue (prices, features)
"""

import logging
import threading
from datetime import datetime, timedelta, timezone
from collections.abc import Generator

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.auth.clerk import verify_clerk_token
from app.db.session import SessionLocal
from app.models.user import Plan
from app.repositories.user import UserRepository
from app.services import email_service, payment_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/payment", tags=["Payment"])


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ─── Request / response schemas ───────────────────────────────────────────────


class OrderRequest(BaseModel):
    plan: str          # "pro" | "enterprise"


class OrderResponse(BaseModel):
    order_id: str
    amount:   int      # paise
    currency: str
    key_id:   str      # Razorpay publishable key for the frontend


class VerifyRequest(BaseModel):
    razorpay_order_id:   str
    razorpay_payment_id: str
    razorpay_signature:  str
    plan:                str


class VerifyResponse(BaseModel):
    success: bool
    plan:    str


class PlanInfo(BaseModel):
    id:       str
    name:     str
    price_inr: int
    features: list[str]


# ─── Auth helper ──────────────────────────────────────────────────────────────

async def _get_clerk_id(request: Request) -> str:
    """Validate the Bearer token and return the Clerk user ID (sub claim).

    Intentionally does NOT open a DB session so each endpoint can share
    a single session for both the SELECT and any subsequent writes.
    """
    auth = request.headers.get("authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    token = auth.removeprefix("Bearer ").strip()
    try:
        payload = await verify_clerk_token(token)
    except Exception as exc:
        raise HTTPException(status_code=401, detail=str(exc))
    return payload["sub"]


def _load_user(db: Session, clerk_id: str):
    """Load a non-deleted user from *db* by clerk_id, or raise 404."""
    repo = UserRepository(db)
    user = repo.find_by_clerk_id(clerk_id)
    if not user or user.is_deleted:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# ─── Endpoints ────────────────────────────────────────────────────────────────

@router.get("/plans", response_model=list[PlanInfo])
def list_plans():
    """Return the available plan catalogue."""
    return [
        PlanInfo(
            id="free",
            name="Free",
            price_inr=0,
            features=[
                "25 short links",
                "Basic analytics",
                "Standard QR codes",
                "7-day click history",
            ],
        ),
        PlanInfo(
            id="pro",
            name="Pro",
            price_inr=499,
            features=[
                "500 short links",
                "Advanced analytics",
                "Custom aliases",
                "90-day click history",
                "Link expiry dates",
                "Priority support",
            ],
        ),
        PlanInfo(
            id="enterprise",
            name="Enterprise",
            price_inr=1999,
            features=[
                "Unlimited short links",
                "Full analytics suite",
                "Custom domains",
                "Unlimited history",
                "Bulk import / export",
                "Dedicated support",
                "SLA guarantee",
            ],
        ),
    ]


@router.post("/order", response_model=OrderResponse)
async def create_order(
    body: OrderRequest,
    db: Session = Depends(get_db),
    clerk_id: str = Depends(_get_clerk_id),
):
    """Create a Razorpay order for the requested plan."""
    _load_user(db, clerk_id)  # auth gate — raises 404 if user not found
    try:
        order = payment_service.create_order(body.plan)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc))

    from app.config.settings import settings as s
    return OrderResponse(
        order_id=order["id"],
        amount=order["amount"],
        currency=order["currency"],
        key_id=s.RAZORPAY_KEY_ID,
    )


@router.post("/verify", response_model=VerifyResponse)
async def verify_payment(
    body: VerifyRequest,
    db: Session = Depends(get_db),
    clerk_id: str = Depends(_get_clerk_id),
):
    """Verify Razorpay signature and upgrade the user's plan.

    IMPORTANT: user is loaded from the same `db` session that commits,
    so the plan update is guaranteed to persist.
    """
    ok = payment_service.verify_payment(
        razorpay_order_id=body.razorpay_order_id,
        razorpay_payment_id=body.razorpay_payment_id,
        razorpay_signature=body.razorpay_signature,
    )
    if not ok:
        raise HTTPException(status_code=400, detail="Invalid payment signature")

    # Validate plan
    plan_str = body.plan.lower()
    try:
        plan_enum = Plan(plan_str)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Unknown plan: {plan_str!r}")

    # Load user from THIS session — ensures commit() below writes the change
    user = _load_user(db, clerk_id)

    repo = UserRepository(db)
    repo.update(
        user,
        plan=plan_enum,
        razorpay_payment_id=body.razorpay_payment_id,
        plan_expires_at=datetime.now(timezone.utc) + timedelta(days=30),
    )
    db.commit()
    db.refresh(user)

    logger.info(
        "Plan upgraded user_id=%s plan=%s payment_id=%s",
        user.id, plan_str, body.razorpay_payment_id,
    )

    # Fire confirmation email (non-blocking best-effort)
    threading.Thread(
        target=email_service.send_plan_upgraded_email,
        kwargs={
            "email":      user.email,
            "name":       user.display_name or "",
            "plan":       plan_str,
            "amount_inr": payment_service.amount_inr(plan_str),
        },
        daemon=True,
    ).start()

    return VerifyResponse(success=True, plan=plan_str)
