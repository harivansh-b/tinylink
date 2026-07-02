from uuid import UUID

from sqlalchemy import ForeignKey, String

from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel


class Click(BaseModel):
    __tablename__ = "clicks"

    url_id: Mapped[UUID] = mapped_column(
        ForeignKey("urls.id", ondelete="CASCADE"),
        nullable=False,
    )

    ip_address: Mapped[str | None] = mapped_column(
        String(64),
    )

    browser: Mapped[str | None] = mapped_column(
        String(100),
    )

    device: Mapped[str | None] = mapped_column(
        String(100),
    )

    country: Mapped[str | None] = mapped_column(
        String(100),
    )

    referer: Mapped[str | None] = mapped_column(
        String(255),
    )

    url = relationship(
        "URL",
        back_populates="clicks",
    )