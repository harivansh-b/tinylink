"""GraphQL input types for URL mutations."""

from datetime import datetime

import strawberry


@strawberry.input
class CreateShortURLInput:
    original_url: str
    custom_alias: str | None = None
    expires_at: datetime | None = None
    title: str | None = None


@strawberry.input
class UpdateShortURLInput:
    custom_alias: str | None = None
    expires_at: datetime | None = None
    is_active: bool | None = None
    title: str | None = None
