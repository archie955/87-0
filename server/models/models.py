
from sqlalchemy import (
    DECIMAL,
    Enum,
    ForeignKey,
    Index,
    Integer,
    String,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.database import Base
from models.enums import Roles
from models.mixins import Name, TimeStamps

roles = Enum(Roles, name="roles")


class User(Base, Name, TimeStamps):
    best_score: Mapped[float] = mapped_column(DECIMAL(4, 2), nullable=True)

    steam_login: Mapped["Steam | None"] = relationship(
        back_populates="user", uselist=False, cascade="all, delete-orphan"
    )

    email_login: Mapped["Email | None"] = relationship(
        back_populates="user", uselist=False, cascade="all, delete-orphan"
    )

    # google_login: Mapped["Google"] = relationship(back_populates="user")


class Steam(Base, Name, TimeStamps):
    profile_name: Mapped[str] = mapped_column(String(200), unique=False, nullable=False)
    url: Mapped[str] = mapped_column(String(200), unique=False, nullable=False)
    avatar: Mapped[str] = mapped_column(String(200), unique=False, nullable=True)
    steam_id: Mapped[str] = mapped_column(String(200), unique=True, nullable=False)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("user.id", ondelete="CASCADE"), unique=True, nullable=False
    )

    user: Mapped["User"] = relationship(back_populates="steam_login")


class Email(Base, Name, TimeStamps):
    email: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(
        String(200), nullable=False, unique=False
    )
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("user.id", ondelete="CASCADE"), unique=True, nullable=False
    )

    user: Mapped["User"] = relationship(back_populates="email_login")


class Team(Base, Name, TimeStamps):
    name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)

    players: Mapped[list["Player"]] = relationship(back_populates="team")


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

    hltv: Mapped[float] = mapped_column(DECIMAL(4, 2), nullable=False)

    igl_bonus: Mapped[float] = mapped_column(DECIMAL(4, 2), nullable=False)

    majors: Mapped[int] = mapped_column(Integer, nullable=False)

    wins: Mapped[int] = mapped_column(Integer, nullable=False)

    second: Mapped[int] = mapped_column(Integer, nullable=False)

    semi: Mapped[int] = mapped_column(Integer, nullable=False)

    quarter: Mapped[int] = mapped_column(Integer, nullable=False)

    total_tournaments: Mapped[int] = mapped_column(Integer, nullable=False)

    major_teammates: Mapped[int] = mapped_column(Integer, nullable=False)

    win_teammates: Mapped[int] = mapped_column(Integer, nullable=False)

    team: Mapped["Team"] = relationship(back_populates="players")
