"""add missing url and user columns

Revision ID: a1b2c3d4e5f6
Revises: 20f20e9a2bfc
Create Date: 2026-07-03 07:45:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = '20f20e9a2bfc'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add title, is_deleted, is_favorite to urls; add display_name, is_deleted to users."""

    # ── urls table ──────────────────────────────────────────────────────────
    op.add_column(
        'urls',
        sa.Column('title', sa.String(length=255), nullable=True),
    )
    op.add_column(
        'urls',
        sa.Column(
            'is_deleted',
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )
    op.add_column(
        'urls',
        sa.Column(
            'is_favorite',
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )

    # Compound indexes for common query patterns
    op.create_index(
        'ix_urls_user_id_is_deleted',
        'urls',
        ['user_id', 'is_deleted'],
    )
    op.create_index(
        'ix_urls_user_id_is_favorite',
        'urls',
        ['user_id', 'is_favorite'],
    )

    # ── users table ──────────────────────────────────────────────────────────
    op.add_column(
        'users',
        sa.Column('display_name', sa.String(length=255), nullable=True),
    )
    op.add_column(
        'users',
        sa.Column(
            'is_deleted',
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )


def downgrade() -> None:
    """Remove the columns added in upgrade."""
    # users
    op.drop_column('users', 'is_deleted')
    op.drop_column('users', 'display_name')

    # urls indexes
    op.drop_index('ix_urls_user_id_is_favorite', table_name='urls')
    op.drop_index('ix_urls_user_id_is_deleted', table_name='urls')

    # urls columns
    op.drop_column('urls', 'is_favorite')
    op.drop_column('urls', 'is_deleted')
    op.drop_column('urls', 'title')
