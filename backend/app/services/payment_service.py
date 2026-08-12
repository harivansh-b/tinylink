"""PaymentService — Razorpay order creation and verification.

Uses Razorpay's raw REST API via httpx so no extra SDK is needed.
All amounts are in **paise** (INR × 100) as required by Razorpay.
"""

import hashlib
import hmac
import logging
import uuid

import httpx

from app.config.settings import settings

logger = logging.getLogger(__name__)

RAZORPAY_BASE = "https://api.razorpay.com/v1"

# ─── Plan catalogue ────────────────────────────────────────────────────────────
# Prices are in paise (1 INR = 100 paise)
PLAN_PRICES: dict[str, int] = {
    "pro":        49900,   # ₹499 / month
    "enterprise": 199900,  # ₹1,999 / month
}

PLAN_LABELS: dict[str, str] = {
    "pro":        "Pro",
    "enterprise": "Enterprise",
}


def _auth() -> tuple[str, str]:
    return (settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)


def create_order(plan: str) -> dict:
    """
    Create a Razorpay order for the given plan.
    Returns the full Razorpay order object (id, amount, currency, …).
    Raises ValueError on bad plan or httpx/API errors.
    """
    plan = plan.lower()
    if plan not in PLAN_PRICES:
        raise ValueError(f"Unknown plan: {plan!r}. Valid: {list(PLAN_PRICES)}")

    amount   = PLAN_PRICES[plan]
    receipt  = f"tinylink_{plan}_{uuid.uuid4().hex[:8]}"

    payload = {
        "amount":          amount,
        "currency":        "INR",
        "receipt":         receipt,
        "notes":           {"plan": plan, "product": "TinyLink"},
        "payment_capture": 1,
    }

    resp = httpx.post(
        f"{RAZORPAY_BASE}/orders",
        auth=_auth(),
        json=payload,
        timeout=10,
    )

    if resp.status_code >= 300:
        logger.error("Razorpay order creation failed %s: %s", resp.status_code, resp.text[:400])
        raise RuntimeError(f"Razorpay error {resp.status_code}: {resp.text[:200]}")

    data = resp.json()
    logger.info("Razorpay order created: %s for plan=%s amount=%s", data["id"], plan, amount)
    return data


def verify_payment(
    *,
    razorpay_order_id: str,
    razorpay_payment_id: str,
    razorpay_signature: str,
) -> bool:
    """
    Verify the HMAC-SHA256 signature returned by Razorpay's checkout.
    Returns True if valid, False otherwise.
    """
    body      = f"{razorpay_order_id}|{razorpay_payment_id}"
    expected  = hmac.new(
        settings.RAZORPAY_KEY_SECRET.encode("utf-8"),
        body.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()
    ok = hmac.compare_digest(expected, razorpay_signature)
    if not ok:
        logger.warning(
            "Signature mismatch order=%s payment=%s", razorpay_order_id, razorpay_payment_id
        )
    return ok


def amount_inr(plan: str) -> int:
    """Return plan price in whole rupees."""
    return PLAN_PRICES.get(plan.lower(), 0) // 100
