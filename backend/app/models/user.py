import enum
from datetime import datetime
from sqlalchemy import Boolean, String, Enum, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel


class Plan(str, enum.Enum):
    free       = "free"
    pro        = "pro"
    enterprise = "enterprise"


class User(BaseModel):
    __tablename__ = "users"

    clerk_id: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
    )

    display_name: Mapped[str | None] = mapped_column(String(255), nullable=True)

    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)

    # Subscription / billing
    plan: Mapped[Plan] = mapped_column(
        Enum(Plan, name="plan_enum"),
        default=Plan.free,
        nullable=False,
        server_default="free",
    )
    razorpay_payment_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    plan_expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    urls: Mapped[list["ShortURL"]] = relationship(  # noqa: F821
        "ShortURL",
        back_populates="user",
        cascade="all, delete-orphan",
    )