from sqlalchemy import ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.database import Base
from models.mixins import Name, TimeStamps
from models.player_model import Player


class IGL(Base, Name, TimeStamps):
    player_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("player.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )

    majors: Mapped[int] = mapped_column(Integer, nullable=False)

    wins: Mapped[int] = mapped_column(Integer, nullable=False)

    second: Mapped[int] = mapped_column(Integer, nullable=False)

    semi: Mapped[int] = mapped_column(Integer, nullable=False)

    quarter: Mapped[int] = mapped_column(Integer, nullable=False)

    total_tournaments: Mapped[int] = mapped_column(Integer, nullable=False)

    major_teammates: Mapped[int] = mapped_column(Integer, nullable=False)

    win_teammates: Mapped[int] = mapped_column(Integer, nullable=False)

    player: Mapped["Player"] = relationship(back_populates="igl")
