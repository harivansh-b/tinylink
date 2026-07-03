"""GraphQL queries for user."""

import strawberry
from strawberry.types import Info

from app.exceptions import UnauthorizedError
from app.graphql.context import GraphQLContext
from app.graphql.types.user import UserType


@strawberry.type
class UserQuery:
    @strawberry.field
    def me(self, info: Info[GraphQLContext, None]) -> UserType:
        """Return the currently authenticated user."""
        user = info.context.current_user
        if user is None:
            raise UnauthorizedError("Authentication required")
        return UserType(
            id=user.id,
            email=user.email,
            display_name=user.display_name,
            created_at=user.created_at,
            updated_at=user.updated_at,
        )
