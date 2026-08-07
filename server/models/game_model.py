from sqlalchemy import DECIMAL, ForeignKey, Index, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.database import Base
from models.igl_model import IGL
from models.mixins import Name, TimeStamps
from models.player_model import Player
from models.user_model import User


class Game(Base, Name, TimeStamps):
    __table_args__ = (
        Index("ix_game_user_id", "user_id"),
        Index("ix_game_awper", "awper_id"),
        Index("ix_game_closer", "closer_id"),
        Index("ix_game_opener", "opener_id"),
        Index("ix_game_support", "support_id"),
        Index("ix_game_flex", "flex_id"),
        Index("ix_game_igl", "igl_id"),
    )

    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("user.id", ondelete="CASCADE"), nullable=False, unique=True
    )

    awper_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("player.id"), nullable=False
    )

    closer_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("player.id"), nullable=False
    )

    opener_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("player.id"), nullable=False
    )

    support_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("player.id"), nullable=False
    )

    flex_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("player.id"), nullable=False
    )

    igl_id: Mapped[int] = mapped_column(Integer, ForeignKey("igl.id"), nullable=False)

    score: Mapped[float] = mapped_column(DECIMAL(3, 2), nullable=False)

    owner: Mapped["User"] = relationship(back_populates="best_game")

    awper: Mapped["Player"] = relationship()

    closer: Mapped["Player"] = relationship()

    opener: Mapped["Player"] = relationship()

    support: Mapped["Player"] = relationship()

    flex: Mapped["Player"] = relationship()

    igl: Mapped["IGL"] = relationship()
