from pydantic import BaseModel, ConfigDict

from models.enums import Roles
from schemas.player_schemas import Player

config = ConfigDict(from_attributes=True)


class Game(BaseModel):
    id: int
    team_1_id: int
    team_2_id: int
    team_3_id: int
    team_4_id: int
    team_5_id: int
    team_6_id: int
    model_config = config


class GamePlayer(Player):
    igl: bool
    model_config = config


class GameResult(BaseModel):
    game_id: int
    player_1: GamePlayer
    player_2: GamePlayer
    player_3: GamePlayer
    player_4: GamePlayer
    player_5: GamePlayer


class ReducedGamePlayer(BaseModel):
    id: int
    role: Roles
    score: float
    igl: bool


class GameList(BaseModel):
    players: list[ReducedGamePlayer]


class GameEvaluation(BaseModel):
    score: float
    best: bool
