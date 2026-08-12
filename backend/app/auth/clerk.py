"""Clerk JWT verification for TinyLink."""

import logging
from typing import Any

import httpx
from jose import JWTError, jwt

from app.config.settings import settings
from app.exceptions import UnauthorizedError

logger = logging.getLogger(__name__)

# Clerk JWKS endpoint
_JWKS_URL_TEMPLATE = "https://{host}/.well-known/jwks.json"


def _get_clerk_domain() -> str:
    """Extract the Clerk domain from the publishable key."""
    key = settings.CLERK_PUBLISHABLE_KEY
    if not key:
        raise UnauthorizedError("Clerk is not configured")
    # Format: pk_live_<base64> or pk_test_<base64>
    # The base64 payload decodes to something like clerk.example.com$
    import base64
    try:
        parts = key.split("_")
        encoded = parts[-1]
        # Pad to multiple of 4
        padded = encoded + "=" * (-len(encoded) % 4)
        decoded = base64.b64decode(padded).decode("utf-8").rstrip("$")
        return decoded
    except Exception:
        # Fallback: derive from secret key
        return "clerk.accounts.dev"


_cached_jwks: dict[str, Any] | None = None


async def _fetch_jwks() -> dict[str, Any]:
    """Fetch JWKS from Clerk (cached in memory)."""
    global _cached_jwks
    if _cached_jwks is not None:
        return _cached_jwks

    domain = _get_clerk_domain()
    url = _JWKS_URL_TEMPLATE.format(host=domain)
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            _cached_jwks = resp.json()
            return _cached_jwks
    except Exception as exc:
        logger.exception("Failed to fetch Clerk JWKS from %s", url)
        raise UnauthorizedError("Could not verify token") from exc


async def verify_clerk_token(token: str) -> dict:
    """
    Verify a Clerk JWT and return the full decoded payload.

    Args:
        token: Raw JWT string (without Bearer prefix).

    Returns:
        Decoded payload dict with at minimum ``sub`` (Clerk user ID),
        ``email``, ``first_name``, ``last_name`` when present.

    Raises:
        UnauthorizedError: If the token is invalid, expired, or unverifiable.
    """
    try:
        # Get the unverified header to find the key id
        header = jwt.get_unverified_header(token)
        kid = header.get("kid")

        jwks = await _fetch_jwks()
        keys = jwks.get("keys", [])

        # Find the matching key
        signing_key: dict[str, Any] | None = None
        for key in keys:
            if not kid or key.get("kid") == kid:
                signing_key = key
                break

        if signing_key is None:
            raise UnauthorizedError("Signing key not found")

        from jose.backends import RSAKey
        public_key = RSAKey(signing_key, algorithm="RS256")

        payload = jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            options={
                "verify_aud": False,
                "leeway": 30,   # tolerate up to 30 s of clock skew
            },
        )

        clerk_id: str | None = payload.get("sub")
        if not clerk_id:
            raise UnauthorizedError("Token missing subject claim")

        return payload  # full payload — caller extracts sub / email / name

    except JWTError as exc:
        logger.warning("JWT verification failed: %s", exc)
        raise UnauthorizedError("Invalid or expired token") from exc
    except UnauthorizedError:
        raise
    except Exception as exc:
        logger.exception("Unexpected error during JWT verification")
        raise UnauthorizedError("Token verification error") from exc

