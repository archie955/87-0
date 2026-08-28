from datetime import datetime

from schemas.base_schema import OrmModel
from schemas.game_schemas import Game


class SteamUser(OrmModel):
    username: str
    url: str
    avatar: str


class SteamProfile(SteamUser):
    username: str
    url: str
    avatar: str
    steam_id: str


class SteamUserOut(SteamUser):
    id: int
    created_at: datetime
    updated_at: datetime
    best_game: Game
