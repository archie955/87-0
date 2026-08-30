"""create tables

Revision ID: efa5b5610486
Revises:
Create Date: 2026-06-23 17:33:10.488419

"""

from collections.abc import Sequence
from datetime import timedelta

import sqlalchemy as sa

from alembic import op
from models.models import roles

# revision identifiers, used by Alembic.
revision: str = "efa5b5610486"
down_revision: str | Sequence[str] | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "user",
        sa.Column(
            "id",
            sa.Integer,
            primary_key=True,
            autoincrement=True,
            nullable=False,
        ),
        sa.Column("username", sa.String(100), unique=True, nullable=False),
        sa.Column("best_score", sa.DECIMAL(4, 2), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
            onupdate=sa.func.now(),
        ),
    )

    op.create_table(
        "steam",
        sa.Column(
            "id",
            sa.Integer,
            primary_key=True,
            autoincrement=True,
            nullable=False
        ),
        sa.Column(
            "profile_name",
            sa.String(200),
            unique=False,
            nullable=False
        ),
        sa.Column(
            "url",
            sa.String(200),
            unique=False,
            nullable=False
        ),
        sa.Column(
            "avatar",
            sa.String(200),
            unique=False,
            nullable=True
        ),
        sa.Column(
            "steam_id",
            sa.String(200),
            unique=True,
            nullable=False
        ),
        sa.Column(
            "user_id",
            sa.Integer,
            sa.ForeignKey("user.id", ondelete="CASCADE"),
            unique=True,
            nullable=False
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
            onupdate=sa.func.now(),
        ),
    )

    op.create_table(
        "email",
        sa.Column(
            "id",
            sa.Integer,
            primary_key=True,
            autoincrement=True,
            nullable=False
        ),
        sa.Column(
            "hashed_password",
            sa.String(200),
            unique=False,
            nullable=False
        ),
        sa.Column(
            "user_id",
            sa.Integer,
            sa.ForeignKey("user.id", ondelete="CASCADE"),
            unique=True,
            nullable=False
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
            onupdate=sa.func.now(),
        ),
    )

    op.create_table(
        "team",
        sa.Column(
            "id",
            sa.Integer,
            primary_key=True,
            autoincrement=True,
            nullable=False,
        ),
        sa.Column("name", sa.String(100), nullable=False, unique=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
            onupdate=sa.func.now(),
        ),
    )

    op.create_table(
        "player",
        sa.Column(
            "id",
            sa.Integer,
            primary_key=True,
            autoincrement=True,
            nullable=False,
        ),
        sa.Column(
            "name",
            sa.String(100),
            nullable=False,
        ),
        sa.Column(
            "role",
            roles,
            nullable=False,
        ),
        sa.Column(
            "team_id",
            sa.Integer,
            sa.ForeignKey("team.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "hltv",
            sa.DECIMAL(4, 2),
            nullable=False,
        ),
        sa.Column("igl_bonus", sa.DECIMAL(4, 2), nullable=False),
        sa.Column(
            "majors",
            sa.Integer,
            nullable=False,
        ),
        sa.Column(
            "wins",
            sa.Integer,
            nullable=False,
        ),
        sa.Column(
            "second",
            sa.Integer,
            nullable=False,
        ),
        sa.Column(
            "semi",
            sa.Integer,
            nullable=False,
        ),
        sa.Column(
            "quarter",
            sa.Integer,
            nullable=False,
        ),
        sa.Column(
            "total_tournaments",
            sa.Integer,
            nullable=False,
        ),
        sa.Column(
            "major_teammates",
            sa.Integer,
            nullable=False,
        ),
        sa.Column(
            "win_teammates",
            sa.Integer,
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
            onupdate=sa.func.now(),
        ),
    )

    op.create_index("ix_player_name", "player", ["name"])
    op.create_index("ix_player_team_id", "player", ["team_id"])
    op.create_index("ix_player_role", "player", ["role"])
    op.create_unique_constraint("uq_player_name_team", "player", ["name", "team_id"])


def downgrade() -> None:
    op.drop_constraint("uq_player_name_team", "player")
    op.drop_index("ix_player_team_id", "player")
    op.drop_index("ix_player_role", "player")
    op.drop_index("ix_player_name", "player")
    op.drop_table("player")

    op.drop_table("team")

    op.drop_table("email")
    op.drop_table("steam")
    op.drop_table("user")
