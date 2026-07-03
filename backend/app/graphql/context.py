"""GraphQL context — injected into every Strawberry resolver."""

from fastapi import Request
from sqlalchemy.orm import Session
from strawberry.fastapi import BaseContext

from app.models.user import User


class GraphQLContext(BaseContext):
    """Context available in every GraphQL resolver.

    Must inherit from strawberry.fastapi.BaseContext so Strawberry's
    FastAPI integration accepts it as a valid custom context.
    """

    def __init__(
        self,
        db: Session,
        request: Request,
        current_user: User | None = None,
    ) -> None:
        super().__init__()
        self.db = db
        self.request = request
        self.current_user = current_user
