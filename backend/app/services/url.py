"""ShortURLService — business logic for link management."""

import logging
import re
import threading
from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy.orm import Session

from app.config.settings import settings
from app.exceptions import (
    AliasAlreadyExistsError,
    NotFoundError,
    UnauthorizedError,
    URLExpiredError,
    ValidationError,
)
from app.models.url import ShortURL
from app.models.user import User
from app.repositories.url import ShortURLRepository
from app.utils.shortcode import generate_short_code, validate_alias
from app.services import email_service

logger = logging.getLogger(__name__)

_ALLOWED_SCHEMES = {"http", "https"}
_URL_PATTERN = re.compile(
    r"^https?://"  # scheme
    r"(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,}"  # domain
    r"(?::\d+)?"  # port
    r"(?:[/?#][^\s]*)?$",
    re.IGNORECASE,
)


class ShortURLService:
    def __init__(self, db: Session) -> None:
        self._repo = ShortURLRepository(db)

    # ─── Validation ──────────────────────────────────────────────────────────

    def _validate_url(self, url: str) -> None:
        url = url.strip()
        try:
            from urllib.parse import urlparse
            parsed = urlparse(url)
        except Exception as exc:
            raise ValidationError("Malformed URL") from exc

        if parsed.scheme not in _ALLOWED_SCHEMES:
            raise ValidationError(
                f"URL scheme '{parsed.scheme}' is not allowed. "
                "Only HTTP and HTTPS are supported."
            )
        if not parsed.netloc:
            raise ValidationError("URL has no host")

    def _validate_expiry(self, expires_at: datetime | None) -> None:
        if expires_at is None:
            return
        now = datetime.now(timezone.utc)
        # Normalise timezone
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at <= now:
            raise ValidationError("Expiration date must be in the future")

    # ─── Short code generation ────────────────────────────────────────────────

    def _generate_unique_code(self, max_attempts: int = 10) -> str:
        for _ in range(max_attempts):
            code = generate_short_code()
            if self._repo.find_by_short_code(code) is None:
                return code
        raise ValidationError("Could not generate a unique short code. Please try again.")

    # ─── CRUD ─────────────────────────────────────────────────────────────────

    def create(
        self,
        user: User,
        original_url: str,
        custom_alias: str | None = None,
        expires_at: datetime | None = None,
        title: str | None = None,
    ) -> ShortURL:
        self._validate_url(original_url)
        self._validate_expiry(expires_at)

        if custom_alias:
            validate_alias(custom_alias)
            if self._repo.find_by_short_code(custom_alias, include_deleted=True) is not None:
                raise AliasAlreadyExistsError(custom_alias)
            short_code = custom_alias
        else:
            short_code = self._generate_unique_code()

        url = self._repo.create(
            user_id=user.id,
            original_url=original_url.strip(),
            short_code=short_code,
            title=title,
            expires_at=expires_at,
        )
        logger.info("Created short URL %s for user_id=%s", short_code, user.id)

        # Email notification — fire and forget in daemon thread
        short_url_str = f"{settings.SHORT_URL_BASE}/{short_code}"
        threading.Thread(
            target=email_service.send_link_created_email,
            kwargs={
                "email":        user.email,
                "name":         user.display_name or "",
                "short_url":    short_url_str,
                "original_url": original_url.strip(),
            },
            daemon=True,
        ).start()

        return url

    def get_by_id(self, url_id: UUID, user: User) -> ShortURL:
        url = self._repo.find_by_id(url_id)
        if url is None:
            raise NotFoundError("Short URL")
        self._assert_owner(url, user)
        return url

    def get_by_code(self, code: str) -> ShortURL:
        url = self._repo.find_by_short_code(code)
        if url is None:
            raise NotFoundError("Short URL")
        return url

    def list_urls(
        self,
        user: User,
        page: int = 1,
        limit: int = 10,
        search: str | None = None,
        status: str | None = None,
        order_by: str = "newest",
    ) -> tuple[list[ShortURL], int]:
        return self._repo.find_by_user(
            user.id,
            page=page,
            limit=limit,
            search=search,
            status=status,
            order_by=order_by,
        )

    def search(self, user: User, query: str) -> list[ShortURL]:
        return self._repo.search_urls(user.id, query)

    def get_expired(self, user: User) -> list[ShortURL]:
        return self._repo.find_expired(user.id)

    def get_favorites(self, user: User) -> list[ShortURL]:
        return self._repo.find_favorites(user.id)

    def update(
        self,
        url_id: UUID,
        user: User,
        custom_alias: str | None = None,
        expires_at: datetime | None = None,
        is_active: bool | None = None,
        title: str | None = None,
    ) -> ShortURL:
        url = self.get_by_id(url_id, user)
        updates: dict[str, object] = {}

        if custom_alias is not None and custom_alias != url.short_code:
            validate_alias(custom_alias)
            existing = self._repo.find_by_short_code(custom_alias, include_deleted=True)
            if existing is not None and existing.id != url.id:
                raise AliasAlreadyExistsError(custom_alias)
            updates["short_code"] = custom_alias

        if expires_at is not None:
            self._validate_expiry(expires_at)
            updates["expires_at"] = expires_at

        if is_active is not None:
            updates["is_active"] = is_active

        if title is not None:
            updates["title"] = title

        if updates:
            url = self._repo.update(url, **updates)
            logger.info("Updated short URL %s", url.short_code)
        return url

    def delete(self, url_id: UUID, user: User) -> ShortURL:
        url = self.get_by_id(url_id, user)
        url = self._repo.soft_delete(url)
        logger.info("Soft-deleted short URL %s", url.short_code)
        return url

    def restore(self, url_id: UUID, user: User) -> ShortURL:
        url = self._repo.find_by_id(url_id, include_deleted=True)
        if url is None:
            raise NotFoundError("Short URL")
        self._assert_owner(url, user)
        url = self._repo.restore(url)
        logger.info("Restored short URL %s", url.short_code)
        return url

    def toggle_favorite(self, url_id: UUID, user: User) -> ShortURL:
        url = self.get_by_id(url_id, user)
        url = self._repo.update(url, is_favorite=not url.is_favorite)
        return url

    def get_dashboard_counts(self, user: User) -> dict[str, int]:
        return self._repo.count_by_user(user.id)

    # ─── Redirect validation ──────────────────────────────────────────────────

    def validate_for_redirect(self, url: ShortURL) -> None:
        """Validate that a URL can be used for redirect."""
        if not url.is_active:
            from app.exceptions import InactiveURLError
            raise InactiveURLError()
        if url.expires_at is not None:
            now = datetime.now(timezone.utc)
            exp = url.expires_at
            if exp.tzinfo is None:
                exp = exp.replace(tzinfo=timezone.utc)
            if exp <= now:
                # Fire expiry notification email to the link owner (best-effort)
                try:
                    from app.db.session import SessionLocal
                    from app.models.user import User as UserModel
                    with SessionLocal() as db:
                        owner = db.get(UserModel, url.user_id)
                        if owner:
                            expired_at_str = exp.strftime("%d %b %Y, %H:%M UTC")
                            short_url_str = f"{settings.SHORT_URL_BASE}/{url.short_code}"
                            threading.Thread(
                                target=email_service.send_link_expiry_email,
                                kwargs={
                                    "email":        owner.email,
                                    "name":         owner.display_name or "",
                                    "short_url":    short_url_str,
                                    "original_url": url.original_url,
                                    "expired_at":   expired_at_str,
                                },
                                daemon=True,
                            ).start()
                except Exception as exc:  # noqa: BLE001
                    logger.warning("Could not send link-expiry email: %s", exc)
                raise URLExpiredError()

    # ─── Helpers ──────────────────────────────────────────────────────────────

    def _assert_owner(self, url: ShortURL, user: User) -> None:
        if url.user_id != user.id:
            raise UnauthorizedError("You do not own this link")

    def get_short_url(self, url: ShortURL) -> str:
        return f"{settings.SHORT_URL_BASE}/{url.short_code}"
