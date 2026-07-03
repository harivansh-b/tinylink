"""UserRepository — database operations for User model."""

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User


class UserRepository:
    def __init__(self, db: Session) -> None:
        self._db = db

    def find_by_id(self, user_id: UUID) -> User | None:
        return self._db.get(User, user_id)

    def find_by_clerk_id(self, clerk_id: str) -> User | None:
        stmt = select(User).where(User.clerk_id == clerk_id)
        return self._db.scalar(stmt)

    def find_by_email(self, email: str) -> User | None:
        stmt = select(User).where(User.email == email)
        return self._db.scalar(stmt)

    def create(
        self,
        clerk_id: str,
        email: str,
        display_name: str | None = None,
    ) -> User:
        user = User(clerk_id=clerk_id, email=email, display_name=display_name)
        self._db.add(user)
        self._db.flush()
        return user

    def update(self, user: User, **kwargs: object) -> User:
        for key, value in kwargs.items():
            setattr(user, key, value)
        self._db.flush()
        return user

    def soft_delete(self, user: User) -> User:
        user.is_deleted = True
        self._db.flush()
        return user
