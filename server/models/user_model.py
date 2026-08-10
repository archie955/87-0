from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.database import Base
from models.game_model import Game
from models.mixins import Name, TimeStamps


class User(Base, Name, TimeStamps):
    email: Mapped[str] = mapped_column(String(100), unqiue=True, nullable=False)

    username: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)

    hashed_pwd: Mapped[str] = mapped_column(String(200), nullable=False, unique=False)

    best_game: Mapped["Game"] = relationship(back_populates="owner")
