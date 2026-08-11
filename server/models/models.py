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
    __table_args__ = (
        Index("ix_user_email", "email"),
        Index("ix_user_username", "username"),
    )

    email: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)

    username: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)

    hashed_password: Mapped[str] = mapped_column(
        String(200), nullable=False, unique=False
    )

    best_game: Mapped["Game"] = relationship(back_populates="owner")


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


class Historic_Player(Base, Name, TimeStamps):
    __table_args__ = (
        Index("ix_historic_player_name", "name"),
        Index("ix_historic_player_team_id", "team_id"),
        Index("ix_historic_player_role", "role"),
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)

    role: Mapped[Roles] = mapped_column(roles, nullable=False)

    team_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("historic_team.id"), nullable=False
    )

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

    team: Mapped["Historic_Team"] = relationship(back_populates="players")


class Team(Base, Name, TimeStamps):
    name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)

    players: Mapped[list["Player"]] = relationship(back_populates="team")


class Historic_Team(Base, Name, TimeStamps):
    name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)

    players: Mapped[list["Historic_Player"]] = relationship(back_populates="team")


class Game(Base, Name, TimeStamps):
    __table_args__ = (
        Index("ix_game_user_id", "user_id"),
        Index("ix_game_awper_id", "awper_id"),
        Index("ix_game_closer_id", "closer_id"),
        Index("ix_game_opener_id", "opener_id"),
        Index("ix_game_support_id", "support_id"),
        Index("ix_game_flex_id", "flex_id"),
        Index("ix_game_igl_id", "igl_id"),
    )

    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("user.id", ondelete="CASCADE"), nullable=False, unique=True
    )

    awper_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("historic_player.id"), nullable=False
    )

    closer_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("historic_player.id"), nullable=False
    )

    opener_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("historic_player.id"), nullable=False
    )

    support_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("historic_player.id"), nullable=False
    )

    flex_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("historic_player.id"), nullable=False
    )

    igl_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("historic_player.id"), nullable=False
    )

    score: Mapped[float] = mapped_column(DECIMAL(3, 2), nullable=False)

    owner: Mapped["User"] = relationship(back_populates="best_game")
