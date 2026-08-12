"""add_plan_and_billing_fields

Revision ID: 7fe588d950cc
Revises: a1b2c3d4e5f6
Create Date: 2026-08-12 18:17:03.471101

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7fe588d950cc'
down_revision: Union[str, Sequence[str], None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create enum type first (Postgres requires this before column use)
    op.execute("CREATE TYPE plan_enum AS ENUM ('free', 'pro', 'enterprise')")

    op.alter_column('clicks', 'referer',
               existing_type=sa.VARCHAR(length=255),
               type_=sa.String(length=500),
               existing_nullable=True)
    op.create_index(op.f('ix_clicks_url_id'), 'clicks', ['url_id'], unique=False)
    op.create_index('ix_clicks_url_id_created_at', 'clicks', ['url_id', 'created_at'], unique=False)

    # Gracefully handle if index exists / doesn't exist
    try:
        op.drop_index(op.f('ix_urls_user_id_is_favorite'), table_name='urls')
    except Exception:
        pass

    op.create_index('ix_urls_click_count', 'urls', ['click_count'], unique=False)
    op.create_index('ix_urls_created_at', 'urls', ['created_at'], unique=False)
    op.create_index(op.f('ix_urls_user_id'), 'urls', ['user_id'], unique=False)

    op.add_column('users', sa.Column('plan', sa.Enum('free', 'pro', 'enterprise', name='plan_enum', create_type=False), server_default='free', nullable=False))
    op.add_column('users', sa.Column('razorpay_payment_id', sa.String(length=255), nullable=True))
    op.add_column('users', sa.Column('plan_expires_at', sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('users', 'plan_expires_at')
    op.drop_column('users', 'razorpay_payment_id')
    op.drop_column('users', 'plan')
    op.execute("DROP TYPE IF EXISTS plan_enum")

    op.drop_index(op.f('ix_urls_user_id'), table_name='urls')
    op.drop_index('ix_urls_created_at', table_name='urls')
    op.drop_index('ix_urls_click_count', table_name='urls')
    try:
        op.create_index(op.f('ix_urls_user_id_is_favorite'), 'urls', ['user_id', 'is_favorite'], unique=False)
    except Exception:
        pass
    op.drop_index('ix_clicks_url_id_created_at', table_name='clicks')
    op.drop_index(op.f('ix_clicks_url_id'), table_name='clicks')
    op.alter_column('clicks', 'referer',
               existing_type=sa.String(length=500),
               type_=sa.VARCHAR(length=255),
               existing_nullable=True)

