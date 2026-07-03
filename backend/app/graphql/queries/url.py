"""GraphQL queries for URLs."""

import math
from uuid import UUID

import strawberry
from strawberry.types import Info

from app.config.settings import settings
from app.exceptions import UnauthorizedError
from app.graphql.context import GraphQLContext
from app.graphql.types.url import (
    PaginatedURLsType,
    PaginationMeta,
    ShortURLType,
    to_short_url_type,
)
from app.services.url import ShortURLService


def _require_user(info: Info[GraphQLContext, None]) -> "User":  # noqa: F821
    user = info.context.current_user
    if user is None:
        raise UnauthorizedError("Authentication required")
    return user


@strawberry.type
class URLQuery:
    @strawberry.field
    def my_urls(
        self,
        info: Info[GraphQLContext, None],
        page: int = 1,
        limit: int = 10,
        search: str | None = None,
        status: str | None = None,
        order_by: str = "newest",
    ) -> PaginatedURLsType:
        """List authenticated user's URLs with pagination, search, filtering."""
        user = _require_user(info)
        svc = ShortURLService(info.context.db)
        urls, total = svc.list_urls(
            user,
            page=page,
            limit=limit,
            search=search,
            status=status,
            order_by=order_by,
        )
        total_pages = max(1, math.ceil(total / limit))
        items = [to_short_url_type(u, settings.SHORT_URL_BASE) for u in urls]
        return PaginatedURLsType(
            items=items,
            pagination=PaginationMeta(
                page=page,
                limit=limit,
                total_count=total,
                total_pages=total_pages,
                has_next_page=page < total_pages,
                has_previous_page=page > 1,
            ),
        )

    @strawberry.field
    def url(self, info: Info[GraphQLContext, None], id: UUID) -> ShortURLType:
        """Get a single URL by ID (owner only)."""
        user = _require_user(info)
        svc = ShortURLService(info.context.db)
        url = svc.get_by_id(id, user)
        return to_short_url_type(url, settings.SHORT_URL_BASE)

    @strawberry.field
    def url_by_code(self, info: Info[GraphQLContext, None], short_code: str) -> ShortURLType:
        """Get URL metadata by short code (no redirect)."""
        svc = ShortURLService(info.context.db)
        url = svc.get_by_code(short_code)
        return to_short_url_type(url, settings.SHORT_URL_BASE)

    @strawberry.field
    def search_urls(
        self,
        info: Info[GraphQLContext, None],
        query: str,
    ) -> list[ShortURLType]:
        """Search user's URLs by original URL, alias, or title."""
        user = _require_user(info)
        svc = ShortURLService(info.context.db)
        urls = svc.search(user, query)
        return [to_short_url_type(u, settings.SHORT_URL_BASE) for u in urls]

    @strawberry.field
    def expired_urls(self, info: Info[GraphQLContext, None]) -> list[ShortURLType]:
        """List all expired URLs for the authenticated user."""
        user = _require_user(info)
        svc = ShortURLService(info.context.db)
        urls = svc.get_expired(user)
        return [to_short_url_type(u, settings.SHORT_URL_BASE) for u in urls]

    @strawberry.field
    def favorite_urls(self, info: Info[GraphQLContext, None]) -> list[ShortURLType]:
        """List all favorited URLs for the authenticated user."""
        user = _require_user(info)
        svc = ShortURLService(info.context.db)
        urls = svc.get_favorites(user)
        return [to_short_url_type(u, settings.SHORT_URL_BASE) for u in urls]
