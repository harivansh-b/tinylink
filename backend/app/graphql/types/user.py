"""GraphQL types for User."""

from datetime import datetime
from uuid import UUID

import strawberry


@strawberry.type
class UserType:
    id: UUID
    email: str
    display_name: str | None
    created_at: datetime
    updated_at: datetime
