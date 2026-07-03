"""ShortURLRepository — database operations for ShortURL model."""

from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.models.url import ShortURL


class ShortURLRepository:
    def __init__(self, db: Session) -> None:
        self._db = db

    def find_by_id(self, url_id: UUID, include_deleted: bool = False) -> ShortURL | None:
        stmt = select(ShortURL).where(ShortURL.id == url_id)
        if not include_deleted:
            stmt = stmt.where(ShortURL.is_deleted.is_(False))
        return self._db.scalar(stmt)

    def find_by_short_code(self, code: str, include_deleted: bool = False) -> ShortURL | None:
        stmt = select(ShortURL).where(ShortURL.short_code == code)
        if not include_deleted:
            stmt = stmt.where(ShortURL.is_deleted.is_(False))
        return self._db.scalar(stmt)

    def find_by_alias(self, alias: str) -> ShortURL | None:
        return self.find_by_short_code(alias)

    def find_by_user(
        self,
        user_id: UUID,
        *,
        page: int = 1,
        limit: int = 10,
        search: str | None = None,
        status: str | None = None,
        order_by: str = "newest",
    ) -> tuple[list[ShortURL], int]:
        stmt = (
            select(ShortURL)
            .where(ShortURL.user_id == user_id)
            .where(ShortURL.is_deleted.is_(False))
        )

        # Search filter
        if search:
            pattern = f"%{search.lower()}%"
            stmt = stmt.where(
                or_(
                    func.lower(ShortURL.original_url).like(pattern),
                    func.lower(ShortURL.short_code).like(pattern),
                    func.lower(ShortURL.title).like(pattern),
                )
            )

        # Status filter
        now = datetime.now(timezone.utc)
        if status == "active":
            stmt = stmt.where(ShortURL.is_active.is_(True)).where(
                or_(ShortURL.expires_at.is_(None), ShortURL.expires_at > now)
            )
        elif status == "inactive":
            stmt = stmt.where(ShortURL.is_active.is_(False))
        elif status == "expired":
            stmt = stmt.where(
                ShortURL.expires_at.isnot(None),
                ShortURL.expires_at <= now,
            )

        # Count
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = self._db.scalar(count_stmt) or 0

        # Ordering
        order_map = {
            "newest": ShortURL.created_at.desc(),
            "oldest": ShortURL.created_at.asc(),
            "most_clicked": ShortURL.click_count.desc(),
            "least_clicked": ShortURL.click_count.asc(),
            "alphabetical": ShortURL.short_code.asc(),
        }
        stmt = stmt.order_by(order_map.get(order_by, ShortURL.created_at.desc()))

        # Pagination
        offset = (page - 1) * limit
        stmt = stmt.offset(offset).limit(limit)

        return list(self._db.scalars(stmt)), total

    def search_urls(self, user_id: UUID, query: str, limit: int = 20) -> list[ShortURL]:
        pattern = f"%{query.lower()}%"
        stmt = (
            select(ShortURL)
            .where(ShortURL.user_id == user_id)
            .where(ShortURL.is_deleted.is_(False))
            .where(
                or_(
                    func.lower(ShortURL.original_url).like(pattern),
                    func.lower(ShortURL.short_code).like(pattern),
                    func.lower(ShortURL.title).like(pattern),
                )
            )
            .limit(limit)
        )
        return list(self._db.scalars(stmt))

    def find_expired(self, user_id: UUID) -> list[ShortURL]:
        now = datetime.now(timezone.utc)
        stmt = (
            select(ShortURL)
            .where(ShortURL.user_id == user_id)
            .where(ShortURL.is_deleted.is_(False))
            .where(ShortURL.expires_at.isnot(None))
            .where(ShortURL.expires_at <= now)
            .order_by(ShortURL.expires_at.desc())
        )
        return list(self._db.scalars(stmt))

    def find_favorites(self, user_id: UUID) -> list[ShortURL]:
        stmt = (
            select(ShortURL)
            .where(ShortURL.user_id == user_id)
            .where(ShortURL.is_deleted.is_(False))
            .where(ShortURL.is_favorite.is_(True))
            .order_by(ShortURL.created_at.desc())
        )
        return list(self._db.scalars(stmt))

    def create(
        self,
        user_id: UUID,
        original_url: str,
        short_code: str,
        title: str | None = None,
        expires_at: datetime | None = None,
    ) -> ShortURL:
        url = ShortURL(
            user_id=user_id,
            original_url=original_url,
            short_code=short_code,
            title=title,
            expires_at=expires_at,
        )
        self._db.add(url)
        self._db.flush()
        return url

    def update(self, url: ShortURL, **kwargs: object) -> ShortURL:
        for key, value in kwargs.items():
            setattr(url, key, value)
        self._db.flush()
        return url

    def soft_delete(self, url: ShortURL) -> ShortURL:
        url.is_deleted = True
        url.is_active = False
        self._db.flush()
        return url

    def restore(self, url: ShortURL) -> ShortURL:
        url.is_deleted = False
        url.is_active = True
        self._db.flush()
        return url

    def increment_clicks(self, url_id: UUID) -> None:
        from sqlalchemy import update
        stmt = (
            update(ShortURL)
            .where(ShortURL.id == url_id)
            .values(click_count=ShortURL.click_count + 1)
        )
        self._db.execute(stmt)
        self._db.flush()

    def count_by_user(self, user_id: UUID) -> dict[str, int]:
        """Return total, active, expired link counts for dashboard."""
        from datetime import datetime, timezone
        now = datetime.now(timezone.utc)
        all_stmt = (
            select(func.count())
            .where(ShortURL.user_id == user_id)
            .where(ShortURL.is_deleted.is_(False))
        )
        active_stmt = all_stmt.where(ShortURL.is_active.is_(True)).where(
            or_(ShortURL.expires_at.is_(None), ShortURL.expires_at > now)
        )
        expired_stmt = all_stmt.where(
            ShortURL.expires_at.isnot(None),
            ShortURL.expires_at <= now,
        )
        total_clicks_stmt = (
            select(func.coalesce(func.sum(ShortURL.click_count), 0))
            .where(ShortURL.user_id == user_id)
            .where(ShortURL.is_deleted.is_(False))
        )
        return {
            "total_links": self._db.scalar(all_stmt) or 0,
            "active_links": self._db.scalar(active_stmt) or 0,
            "expired_links": self._db.scalar(expired_stmt) or 0,
            "total_clicks": self._db.scalar(total_clicks_stmt) or 0,
        }
