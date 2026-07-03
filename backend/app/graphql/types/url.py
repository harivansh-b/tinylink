"""GraphQL types for ShortURL."""

from datetime import datetime
from uuid import UUID

import strawberry

from app.models.url import ShortURL as ShortURLModel


@strawberry.type
class ShortURLType:
    id: UUID
    original_url: str
    short_code: str
    title: str | None
    click_count: int
    is_active: bool
    is_favorite: bool
    expires_at: datetime | None
    created_at: datetime
    updated_at: datetime
    short_url: str


@strawberry.type
class PaginationMeta:
    page: int
    limit: int
    total_count: int
    total_pages: int
    has_next_page: bool
    has_previous_page: bool


@strawberry.type
class PaginatedURLsType:
    items: list[ShortURLType]
    pagination: PaginationMeta


def to_short_url_type(url: ShortURLModel, base_url: str = "") -> ShortURLType:
    """Convert a SQLAlchemy ShortURL model to a Strawberry type."""
    return ShortURLType(
        id=url.id,
        original_url=url.original_url,
        short_code=url.short_code,
        title=url.title,
        click_count=url.click_count,
        is_active=url.is_active,
        is_favorite=url.is_favorite,
        expires_at=url.expires_at,
        created_at=url.created_at,
        updated_at=url.updated_at,
        short_url=f"{base_url}/{url.short_code}" if base_url else url.short_code,
    )
