"""FastAPI dependencies for authentication."""

import logging
from typing import Annotated

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.clerk import verify_clerk_token
from app.db.dependencies import get_db
from app.exceptions import UnauthorizedError
from app.models.user import User
from app.repositories.user import UserRepository

logger = logging.getLogger(__name__)


async def get_current_user(
    db: Annotated[Session, Depends(get_db)],
    authorization: str | None = Header(default=None),
) -> User:
    """
    Extract and verify the Clerk JWT from the Authorization header.

    Returns the local User record.
    Raises HTTP 401 if the token is missing or invalid.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header",
        )

    token = authorization.removeprefix("Bearer ").strip()

    try:
        payload = await verify_clerk_token(token)
        clerk_id: str = payload["sub"]
    except UnauthorizedError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
        ) from exc

    repo = UserRepository(db)
    user = repo.find_by_clerk_id(clerk_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found. Please sign in again.",
        )

    if user.is_deleted:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account has been deleted.",
        )

    return user


async def get_optional_user(
    db: Annotated[Session, Depends(get_db)],
    authorization: str | None = Header(default=None),
) -> User | None:
    """Return the current user, or None if not authenticated."""
    if not authorization:
        return None
    try:
        return await get_current_user(db, authorization)
    except HTTPException:
        return None
