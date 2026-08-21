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
        sa.Column(
            "email",
            sa.String(100),
            nullable=False,
            unique=True,
        ),
        sa.Column(
            "username",
            sa.String(100),
            unique=True,
            nullable=False,
        ),
        sa.Column("hashed_password", sa.String(200), nullable=False, unique=False),
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
    op.create_index("ix_user_email", "user", ["email"])
    op.create_index("ix_user_username", "user", ["username"])

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
            sa.ARRAY(roles),
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
            sa.DECIMAL(3, 2),
            nullable=False,
        ),
        sa.Column("igl_bonus", sa.Integer, nullable=False),
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

    op.create_table(
        "active_game",
        sa.Column(
            "id", sa.Integer, primary_key=True, autoincrement=True, nullable=False
        ),
        sa.Column("team_1_id", sa.Integer, sa.ForeignKey("team.id"), nullable=False),
        sa.Column("team_2_id", sa.Integer, sa.ForeignKey("team.id"), nullable=False),
        sa.Column("team_3_id", sa.Integer, sa.ForeignKey("team.id"), nullable=False),
        sa.Column("team_4_id", sa.Integer, sa.ForeignKey("team.id"), nullable=False),
        sa.Column("team_5_id", sa.Integer, sa.ForeignKey("team.id"), nullable=False),
        sa.Column("team_6_id", sa.Integer, sa.ForeignKey("team.id"), nullable=False),
        sa.Column(
            "expiry",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now() + timedelta(minutes=30),
        ),
    )


def downgrade() -> None:
    op.drop_table("active_game")

    op.drop_constraint("uq_player_name_team", "player")
    op.drop_index("ix_player_team_id", "player")
    op.drop_index("ix_player_role", "player")
    op.drop_index("ix_player_name", "player")
    op.drop_table("player")

    op.drop_table("team")

    op.drop_index("ix_user_email", "user")
    op.drop_index("ix_user_username", "user")
    op.drop_table("user")
