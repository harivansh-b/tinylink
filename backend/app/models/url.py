from datetime import datetime
from uuid import UUID

from sqlalchemy import Boolean, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel


class ShortURL(BaseModel):
    __tablename__ = "urls"

    user_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    original_url: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )

    short_code: Mapped[str] = mapped_column(
        String(20),
        unique=True,
        index=True,
        nullable=False,
    )

    click_count: Mapped[int] = mapped_column(
        Integer,
        default=0,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
    )

    expires_at: Mapped[datetime | None]

    user = relationship(
        "User",
        back_populates="urls",
    )

    clicks = relationship(
        "Click",
        back_populates="url",
        cascade="all, delete-orphan",
    )