"""GraphQL queries for analytics and dashboard."""

from uuid import UUID

import strawberry
from strawberry.types import Info

from app.exceptions import UnauthorizedError
from app.graphql.context import GraphQLContext
from app.graphql.types.analytics import (
    AnalyticsType,
    DailyClickType,
    StatItemType,
)
from app.graphql.types.dashboard import DashboardType
from app.services.analytics import AnalyticsService
from app.services.cache_service import CacheService


@strawberry.type
class AnalyticsQuery:
    @strawberry.field
    def analytics(
        self,
        info: Info[GraphQLContext, None],
        url_id: UUID,
        days: int = 30,
    ) -> AnalyticsType:
        """Full analytics for a single URL (owner only)."""
        user = info.context.current_user
        if user is None:
            raise UnauthorizedError("Authentication required")

        cache = CacheService()
        cached = cache.get_analytics(str(url_id))
        if cached:
            return _dict_to_analytics_type(cached)

        svc = AnalyticsService(info.context.db)
        data = svc.get_analytics(url_id, user, days=days)
        cache.set_analytics(str(url_id), data)
        return _dict_to_analytics_type(data)

    @strawberry.field
    def dashboard_stats(self, info: Info[GraphQLContext, None]) -> DashboardType:
        """Aggregate dashboard statistics for the authenticated user."""
        user = info.context.current_user
        if user is None:
            raise UnauthorizedError("Authentication required")

        cache = CacheService()
        cached = cache.get_dashboard(str(user.id))
        if cached:
            return DashboardType(**cached)

        svc = AnalyticsService(info.context.db)
        data = svc.get_dashboard_stats(user)
        cache.set_dashboard(str(user.id), data)
        return DashboardType(**data)

    @strawberry.field
    def dashboard(self, info: Info[GraphQLContext, None]) -> DashboardType:
        """Alias for dashboardStats (backwards compatibility)."""
        return self.dashboard_stats(info=info)


def _dict_to_analytics_type(data: dict) -> AnalyticsType:
    """Convert raw analytics dict to Strawberry type."""
    return AnalyticsType(
        url_id=data["url_id"],
        short_code=data["short_code"],
        total_clicks=data["total_clicks"],
        unique_visitors=data["unique_visitors"],
        daily_clicks=[
            DailyClickType(date=d["date"], clicks=d["clicks"])
            for d in data.get("daily_clicks", [])
        ],
        top_browsers=[
            StatItemType(name=b["browser"], count=b["count"])
            for b in data.get("top_browsers", [])
        ],
        top_devices=[
            StatItemType(name=d["device"], count=d["count"])
            for d in data.get("top_devices", [])
        ],
        top_countries=[
            StatItemType(name=c["country"], count=c["count"])
            for c in data.get("top_countries", [])
        ],
        top_referrers=[
            StatItemType(name=r["referer"], count=r["count"])
            for r in data.get("top_referrers", [])
        ],
    )
