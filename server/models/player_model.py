from sqlalchemy import DECIMAL, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.database import Base
from models.enums import Roles
from models.mixins import Name, TimeStamps
from models.team_model import Team

roles = Enum(Roles, name="roles")


class Player(Base, Name, TimeStamps):
    player_name: Mapped[str] = mapped_column(
        String(100), nullable=False, unique=True, index=True
    )

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
