"""Base62 short code generation for TinyLink."""

import secrets
import string

_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
_BASE = len(_ALPHABET)  # 62

RESERVED_WORDS: frozenset[str] = frozenset(
    {
        "admin",
        "login",
        "graphql",
        "health",
        "docs",
        "metrics",
        "api",
        "favicon.ico",
        "static",
        "webhooks",
        "auth",
        "signup",
        "signin",
        "logout",
        "dashboard",
        "settings",
        "links",
        "analytics",
        "robots.txt",
        "sitemap.xml",
    }
)

ALIAS_MIN_LEN = 3
ALIAS_MAX_LEN = 20
CODE_LENGTH = 7


def base62_encode(number: int) -> str:
    """Encode an integer to a base62 string."""
    if number == 0:
        return _ALPHABET[0]
    chars: list[str] = []
    while number:
        chars.append(_ALPHABET[number % _BASE])
        number //= _BASE
    return "".join(reversed(chars))


def generate_short_code(length: int = CODE_LENGTH) -> str:
    """Generate a cryptographically random base62 short code."""
    # Use random bytes → integer → base62
    random_int = int.from_bytes(secrets.token_bytes(8), "big")
    code = base62_encode(random_int)
    # Ensure consistent length by padding or trimming
    if len(code) < length:
        code = code.zfill(length)
    return code[:length]


def validate_alias(alias: str) -> None:
    """
    Validate a custom alias.

    Raises ValueError with a descriptive message on failure.
    """
    if len(alias) < ALIAS_MIN_LEN:
        raise ValueError(
            f"Alias must be at least {ALIAS_MIN_LEN} characters long."
        )
    if len(alias) > ALIAS_MAX_LEN:
        raise ValueError(
            f"Alias must be at most {ALIAS_MAX_LEN} characters long."
        )
    allowed = set(string.ascii_letters + string.digits + "-_")
    invalid = set(alias) - allowed
    if invalid:
        raise ValueError(
            f"Alias contains invalid characters: {', '.join(sorted(invalid))}. "
            "Only letters, numbers, hyphens, and underscores are allowed."
        )
    if alias.lower() in RESERVED_WORDS:
        raise ValueError(f"'{alias}' is a reserved word and cannot be used as an alias.")
