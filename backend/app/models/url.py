from datetime import datetime
from uuid import UUID

from sqlalchemy import Boolean, ForeignKey, Index, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel


class ShortURL(BaseModel):
    __tablename__ = "urls"

    user_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    original_url: Mapped[str] = mapped_column(String, nullable=False)

    short_code: Mapped[str] = mapped_column(
        String(20),
        unique=True,
        index=True,
        nullable=False,
    )

    title: Mapped[str | None] = mapped_column(String(255), nullable=True)

    click_count: Mapped[int] = mapped_column(Integer, default=0)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)

    is_favorite: Mapped[bool] = mapped_column(Boolean, default=False)

    expires_at: Mapped[datetime | None]

    user: Mapped["User"] = relationship(  # noqa: F821
        "User",
        back_populates="urls",
    )

    clicks: Mapped[list["Click"]] = relationship(  # noqa: F821
        "Click",
        back_populates="url",
        cascade="all, delete-orphan",
    )

    __table_args__ = (
        Index("ix_urls_user_id_is_deleted", "user_id", "is_deleted"),
        Index("ix_urls_created_at", "created_at"),
        Index("ix_urls_click_count", "click_count"),
    )