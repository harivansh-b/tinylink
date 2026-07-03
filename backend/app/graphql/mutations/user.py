"""GraphQL mutations for user profile."""

import strawberry
from strawberry.types import Info

from app.exceptions import UnauthorizedError
from app.graphql.context import GraphQLContext
from app.graphql.types.user import UserType
from app.services.user import UserService


@strawberry.type
class UserMutation:
    @strawberry.mutation
    def update_profile(
        self,
        info: Info[GraphQLContext, None],
        display_name: str | None = None,
    ) -> UserType:
        """Update the authenticated user's profile."""
        user = info.context.current_user
        if user is None:
            raise UnauthorizedError("Authentication required")

        svc = UserService(info.context.db)
        updated = svc.update_profile(user, display_name=display_name)
        info.context.db.commit()

        return UserType(
            id=updated.id,
            email=updated.email,
            display_name=updated.display_name,
            created_at=updated.created_at,
            updated_at=updated.updated_at,
        )
