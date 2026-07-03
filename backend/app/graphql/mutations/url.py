"""GraphQL mutations for URLs."""

from uuid import UUID

import strawberry
from strawberry.types import Info

from app.config.settings import settings
from app.exceptions import UnauthorizedError
from app.graphql.context import GraphQLContext
from app.graphql.inputs.url import CreateShortURLInput, UpdateShortURLInput
from app.graphql.types.url import ShortURLType, to_short_url_type
from app.services.cache_service import CacheService
from app.services.url import ShortURLService
from app.utils.qr import generate_qr_base64


def _require_user(info: Info[GraphQLContext, None]) -> "User":  # noqa: F821
    user = info.context.current_user
    if user is None:
        raise UnauthorizedError("Authentication required")
    return user


@strawberry.type
class URLMutation:
    @strawberry.mutation
    def create_short_url(
        self,
        info: Info[GraphQLContext, None],
        input: CreateShortURLInput,
    ) -> ShortURLType:
        """Create a new short URL."""
        user = _require_user(info)
        svc = ShortURLService(info.context.db)
        url = svc.create(
            user=user,
            original_url=input.original_url,
            custom_alias=input.custom_alias,
            expires_at=input.expires_at,
            title=input.title,
        )
        info.context.db.commit()

        # Invalidate dashboard cache
        CacheService().invalidate_dashboard(str(user.id))

        return to_short_url_type(url, settings.SHORT_URL_BASE)

    @strawberry.mutation
    def update_short_url(
        self,
        info: Info[GraphQLContext, None],
        id: UUID,
        input: UpdateShortURLInput,
    ) -> ShortURLType:
        """Update an existing short URL."""
        user = _require_user(info)
        svc = ShortURLService(info.context.db)

        # Get old short_code before update for cache invalidation
        old_url = svc.get_by_id(id, user)
        old_code = old_url.short_code

        url = svc.update(
            url_id=id,
            user=user,
            custom_alias=input.custom_alias,
            expires_at=input.expires_at,
            is_active=input.is_active,
            title=input.title,
        )
        info.context.db.commit()

        # Invalidate caches
        cache = CacheService()
        cache.invalidate_redirect(old_code)
        if url.short_code != old_code:
            cache.invalidate_redirect(url.short_code)
        cache.invalidate_dashboard(str(user.id))

        return to_short_url_type(url, settings.SHORT_URL_BASE)

    @strawberry.mutation
    def delete_short_url(self, info: Info[GraphQLContext, None], id: UUID) -> ShortURLType:
        """Soft-delete a short URL."""
        user = _require_user(info)
        svc = ShortURLService(info.context.db)
        url = svc.delete(id, user)
        info.context.db.commit()

        # Invalidate caches
        cache = CacheService()
        cache.invalidate_redirect(url.short_code)
        cache.invalidate_dashboard(str(user.id))

        return to_short_url_type(url, settings.SHORT_URL_BASE)

    @strawberry.mutation
    def restore_short_url(self, info: Info[GraphQLContext, None], id: UUID) -> ShortURLType:
        """Restore a soft-deleted short URL."""
        user = _require_user(info)
        svc = ShortURLService(info.context.db)
        url = svc.restore(id, user)
        info.context.db.commit()

        # Invalidate caches
        cache = CacheService()
        cache.invalidate_redirect(url.short_code)
        cache.invalidate_dashboard(str(user.id))

        return to_short_url_type(url, settings.SHORT_URL_BASE)

    @strawberry.mutation
    def toggle_favorite(self, info: Info[GraphQLContext, None], id: UUID) -> ShortURLType:
        """Star / unstar a short URL."""
        user = _require_user(info)
        svc = ShortURLService(info.context.db)
        url = svc.toggle_favorite(id, user)
        info.context.db.commit()
        return to_short_url_type(url, settings.SHORT_URL_BASE)

    @strawberry.mutation
    def generate_qr_code(self, info: Info[GraphQLContext, None], id: UUID) -> str:
        """Generate a QR code PNG (base64 data URI) for a short URL."""
        user = _require_user(info)
        svc = ShortURLService(info.context.db)
        url = svc.get_by_id(id, user)
        full_url = f"{settings.SHORT_URL_BASE}/{url.short_code}"
        return generate_qr_base64(full_url)
