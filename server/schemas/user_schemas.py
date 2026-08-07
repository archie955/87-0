from datetime import datetime

from pydantic import BaseModel, ConfigDict

from schemas.game_schemas import Game

config = ConfigDict(from_attributes=True)


class User(BaseModel):
    username: str
    url: str
    avatar: str
    model_config = config


class Profile(User):
    username: str
    url: str
    avatar: str
    steam_id: str


class UserOut(User):
    id: int
    created_at: datetime
    updated_at: datetime
    best_game: Game
    model_config = config
