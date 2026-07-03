"""GraphQL types for analytics."""

import strawberry


@strawberry.type
class DailyClickType:
    date: str
    clicks: int


@strawberry.type
class StatItemType:
    name: str
    count: int


@strawberry.type
class AnalyticsType:
    url_id: str
    short_code: str
    total_clicks: int
    unique_visitors: int
    daily_clicks: list[DailyClickType]
    top_browsers: list[StatItemType]
    top_devices: list[StatItemType]
    top_countries: list[StatItemType]
    top_referrers: list[StatItemType]
