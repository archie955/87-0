from datetime import datetime, timedelta

from sqlalchemy import (
    DECIMAL,
    DateTime,
    Enum,
    ForeignKey,
    Index,
    Integer,
    String,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.database import Base
from models.enums import Roles
from models.mixins import Name, TimeStamps

roles = Enum(Roles, name="roles")


class User(Base, Name, TimeStamps):
    __table_args__ = (
        Index("ix_user_email", "email"),
        Index("ix_user_username", "username"),
    )

    email: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)

    username: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)

    hashed_password: Mapped[str] = mapped_column(
        String(200), nullable=False, unique=False
    )

    best_score: Mapped[float] = mapped_column(DECIMAL(3, 2), nullable=True)


class Player(Base, Name, TimeStamps):
    __table_args__ = (
        Index("ix_player_name", "name"),
        Index("ix_player_team_id", "team_id"),
        Index("ix_player_role", "role"),
        UniqueConstraint("name", "team_id", name="uq_player_name_team"),
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)

    role: Mapped[Roles] = mapped_column(roles, nullable=False)

    team_id: Mapped[int] = mapped_column(Integer, ForeignKey("team.id"), nullable=False)

    hltv: Mapped[float] = mapped_column(DECIMAL(3, 2), nullable=False)

    igl_bonus: Mapped[float] = mapped_column(DECIMAL(3, 2), nullable=False)

    majors: Mapped[int] = mapped_column(Integer, nullable=False)

    wins: Mapped[int] = mapped_column(Integer, nullable=False)

    second: Mapped[int] = mapped_column(Integer, nullable=False)

    semi: Mapped[int] = mapped_column(Integer, nullable=False)

    quarter: Mapped[int] = mapped_column(Integer, nullable=False)

    total_tournaments: Mapped[int] = mapped_column(Integer, nullable=False)

    major_teammates: Mapped[int] = mapped_column(Integer, nullable=False)

    win_teammates: Mapped[int] = mapped_column(Integer, nullable=False)

    team: Mapped["Team"] = relationship(back_populates="players")


class Team(Base, Name, TimeStamps):
    name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)

    players: Mapped[list["Player"]] = relationship(back_populates="team")


class Active_Game(Base, Name):
    team_1_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("team.id"), nullable=False
    )

    team_2_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("team.id"), nullable=False
    )

    team_3_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("team.id"), nullable=False
    )

    team_4_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("team.id"), nullable=False
    )

    team_5_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("team.id"), nullable=False
    )

    team_6_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("team.id"), nullable=False
    )

    expiry: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now() + timedelta(minutes=30),
    )
