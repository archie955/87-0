from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.database import Base
from models.game_model import Game
from models.mixins import Name, TimeStamps


class User(Base, Name, TimeStamps):
    username: Mapped[str] = mapped_column(String(100), nullable=False, unique=False)

    url: Mapped[str] = mapped_column(String(200), nullable=False, unique=False)

    steam_id: Mapped[str] = mapped_column(String(200), nullable=False, unique=True)

    avatar: Mapped[str] = mapped_column(String(100), nullable=True)

    best_game: Mapped["Game"] = relationship(back_populates="owner")
