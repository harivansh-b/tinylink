"""AnalyticsService — business logic for link analytics."""

import logging
from uuid import UUID

from sqlalchemy.orm import Session

from app.exceptions import NotFoundError, UnauthorizedError
from app.models.user import User
from app.repositories.click import ClickRepository
from app.repositories.url import ShortURLRepository

logger = logging.getLogger(__name__)


class AnalyticsService:
    def __init__(self, db: Session) -> None:
        self._url_repo = ShortURLRepository(db)
        self._click_repo = ClickRepository(db)

    def get_analytics(self, url_id: UUID, user: User, days: int = 30) -> dict[str, object]:
        """
        Return full analytics for a URL owned by the given user.

        Raises:
            NotFoundError: if the URL does not exist.
            UnauthorizedError: if the user does not own the URL.
        """
        url = self._url_repo.find_by_id(url_id)
        if url is None:
            raise NotFoundError("Short URL")
        if url.user_id != user.id:
            raise UnauthorizedError("You do not have access to this URL's analytics")

        return {
            "url_id": str(url_id),
            "short_code": url.short_code,
            "total_clicks": self._click_repo.count_total(url_id),
            "unique_visitors": self._click_repo.count_unique_visitors(url_id),
            "daily_clicks": self._click_repo.count_by_day(url_id, days=days),
            "top_browsers": self._click_repo.browser_stats(url_id),
            "top_devices": self._click_repo.device_stats(url_id),
            "top_countries": self._click_repo.country_stats(url_id),
            "top_referrers": self._click_repo.referrer_stats(url_id),
        }

    def get_dashboard_stats(self, user: User) -> dict[str, object]:
        """
        Return aggregate dashboard statistics for a user:
        total links, total clicks, active links, expired links.
        """
        counts = self._url_repo.count_by_user(user.id)
        return {
            "total_links": counts["total_links"],
            "total_clicks": counts["total_clicks"],
            "active_links": counts["active_links"],
            "expired_links": counts["expired_links"],
        }
