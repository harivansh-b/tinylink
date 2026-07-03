from uuid import UUID

from sqlalchemy import ForeignKey, Index, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel


class Click(BaseModel):
    __tablename__ = "clicks"

    # clicks don't need updated_at
    url_id: Mapped[UUID] = mapped_column(
        ForeignKey("urls.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    ip_address: Mapped[str | None] = mapped_column(String(64))
    browser: Mapped[str | None] = mapped_column(String(100))
    device: Mapped[str | None] = mapped_column(String(100))
    country: Mapped[str | None] = mapped_column(String(100))
    referer: Mapped[str | None] = mapped_column(String(500))

    url: Mapped["ShortURL"] = relationship(  # noqa: F821
        "ShortURL",
        back_populates="clicks",
    )

    __table_args__ = (
        Index("ix_clicks_url_id_created_at", "url_id", "created_at"),
    )