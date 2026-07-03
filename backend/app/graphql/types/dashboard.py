"""GraphQL types for dashboard."""

import strawberry


@strawberry.type
class DashboardType:
    total_links: int
    total_clicks: int
    active_links: int
    expired_links: int
