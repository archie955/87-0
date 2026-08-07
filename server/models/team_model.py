from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.database import Base
from models.mixins import Name, TimeStamps
from models.player_model import Player


class Team(Base, Name, TimeStamps):
    name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)

    players: Mapped[list["Player"]] = relationship(back_populates="team")
