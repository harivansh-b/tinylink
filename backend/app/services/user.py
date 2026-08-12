import logging
import threading

from sqlalchemy.orm import Session

from app.models.user import User
from app.repositories.user import UserRepository
from app.services import email_service

logger = logging.getLogger(__name__)


class UserService:
    def __init__(self, db: Session) -> None:
        self._repo = UserRepository(db)

    def find_or_create(
        self,
        clerk_id: str,
        email: str,
        display_name: str | None = None,
    ) -> User:
        """
        Find an existing user by Clerk ID, or create one if not found.
        Used during first login / token verification.
        """
        user = self._repo.find_by_clerk_id(clerk_id)
        if user is None:
            user = self._repo.create(
                clerk_id=clerk_id,
                email=email,
                display_name=display_name,
            )
            logger.info("Created new user clerk_id=%s email=%s", clerk_id, email)
            # Send welcome email in a background thread so it never blocks auth
            threading.Thread(
                target=email_service.send_welcome_email,
                kwargs={"email": email, "name": display_name or ""},
                daemon=True,
            ).start()
        return user

    def get_by_id(self, user_id: object) -> User | None:
        from uuid import UUID
        if isinstance(user_id, str):
            user_id = UUID(user_id)
        return self._repo.find_by_id(user_id)  # type: ignore[arg-type]

    def update_profile(
        self,
        user: User,
        display_name: str | None = None,
        email: str | None = None,
    ) -> User:
        """Update user profile fields."""
        updates: dict[str, object] = {}
        if display_name is not None:
            updates["display_name"] = display_name
        if email is not None:
            updates["email"] = email
        if updates:
            user = self._repo.update(user, **updates)
            logger.info("Updated profile for user_id=%s", user.id)
        return user

    def sync_from_webhook(
        self,
        clerk_id: str,
        email: str,
        display_name: str | None = None,
    ) -> User:
        """Upsert a user record from a Clerk webhook payload."""
        user = self._repo.find_by_clerk_id(clerk_id)
        if user is None:
            user = self._repo.create(
                clerk_id=clerk_id,
                email=email,
                display_name=display_name,
            )
            logger.info("Webhook: created user clerk_id=%s", clerk_id)
        else:
            user = self._repo.update(
                user,
                email=email,
                display_name=display_name or user.display_name,
                is_deleted=False,
            )
            logger.info("Webhook: updated user clerk_id=%s", clerk_id)
        return user

    def soft_delete(self, clerk_id: str) -> None:
        """Soft-delete a user from a Clerk webhook deletion event."""
        user = self._repo.find_by_clerk_id(clerk_id)
        if user is not None:
            self._repo.soft_delete(user)
            logger.info("Webhook: soft-deleted user clerk_id=%s", clerk_id)
