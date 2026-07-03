"""ClickRepository — database operations for Click analytics."""

from datetime import date
from uuid import UUID

from sqlalchemy import Date, cast, func, select
from sqlalchemy.orm import Session

from app.models.click import Click


class ClickRepository:
    def __init__(self, db: Session) -> None:
        self._db = db

    def create(
        self,
        url_id: UUID,
        ip_address: str | None = None,
        browser: str | None = None,
        device: str | None = None,
        country: str | None = None,
        referer: str | None = None,
    ) -> Click:
        click = Click(
            url_id=url_id,
            ip_address=ip_address,
            browser=browser,
            device=device,
            country=country,
            referer=referer,
        )
        self._db.add(click)
        self._db.flush()
        return click

    def find_by_url(self, url_id: UUID) -> list[Click]:
        stmt = (
            select(Click)
            .where(Click.url_id == url_id)
            .order_by(Click.created_at.desc())
        )
        return list(self._db.scalars(stmt))

    def count_total(self, url_id: UUID) -> int:
        stmt = select(func.count()).where(Click.url_id == url_id)
        return self._db.scalar(stmt) or 0

    def count_unique_visitors(self, url_id: UUID) -> int:
        """Count distinct IP addresses (proxy for unique visitors)."""
        stmt = (
            select(func.count(func.distinct(Click.ip_address)))
            .where(Click.url_id == url_id)
            .where(Click.ip_address.isnot(None))
        )
        return self._db.scalar(stmt) or 0

    def count_by_day(
        self,
        url_id: UUID,
        days: int = 30,
    ) -> list[dict[str, object]]:
        """Return daily click counts for the last N days."""
        from sqlalchemy import text

        stmt = (
            select(
                cast(Click.created_at, Date).label("date"),
                func.count().label("clicks"),
            )
            .where(Click.url_id == url_id)
            .where(
                Click.created_at >= text(f"NOW() - INTERVAL '{days} days'")
            )
            .group_by(cast(Click.created_at, Date))
            .order_by(cast(Click.created_at, Date))
        )
        rows = self._db.execute(stmt).all()
        return [{"date": str(row.date), "clicks": row.clicks} for row in rows]

    def browser_stats(self, url_id: UUID, limit: int = 10) -> list[dict[str, object]]:
        stmt = (
            select(Click.browser, func.count().label("count"))
            .where(Click.url_id == url_id)
            .where(Click.browser.isnot(None))
            .group_by(Click.browser)
            .order_by(func.count().desc())
            .limit(limit)
        )
        rows = self._db.execute(stmt).all()
        return [{"browser": row.browser, "count": row.count} for row in rows]

    def device_stats(self, url_id: UUID, limit: int = 10) -> list[dict[str, object]]:
        stmt = (
            select(Click.device, func.count().label("count"))
            .where(Click.url_id == url_id)
            .where(Click.device.isnot(None))
            .group_by(Click.device)
            .order_by(func.count().desc())
            .limit(limit)
        )
        rows = self._db.execute(stmt).all()
        return [{"device": row.device, "count": row.count} for row in rows]

    def country_stats(self, url_id: UUID, limit: int = 10) -> list[dict[str, object]]:
        stmt = (
            select(Click.country, func.count().label("count"))
            .where(Click.url_id == url_id)
            .where(Click.country.isnot(None))
            .group_by(Click.country)
            .order_by(func.count().desc())
            .limit(limit)
        )
        rows = self._db.execute(stmt).all()
        return [{"country": row.country, "count": row.count} for row in rows]

    def referrer_stats(self, url_id: UUID, limit: int = 10) -> list[dict[str, object]]:
        stmt = (
            select(Click.referer, func.count().label("count"))
            .where(Click.url_id == url_id)
            .where(Click.referer.isnot(None))
            .group_by(Click.referer)
            .order_by(func.count().desc())
            .limit(limit)
        )
        rows = self._db.execute(stmt).all()
        return [{"referer": row.referer, "count": row.count} for row in rows]

    def top_referrer(self, url_id: UUID) -> str | None:
        """Return the highest-traffic referrer for a URL."""
        rows = self.referrer_stats(url_id, limit=1)
        return rows[0]["referer"] if rows else None  # type: ignore[return-value]
