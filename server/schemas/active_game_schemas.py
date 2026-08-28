from pydantic import BaseModel

from models.enums import Roles
from schemas.base_schema import OrmModel
from schemas.player_schemas import Player


class ActiveGame(OrmModel):
    id: int
    team_1_id: int
    team_2_id: int
    team_3_id: int
    team_4_id: int
    team_5_id: int
    team_6_id: int


class GameResult(BaseModel):
    game_id: int
    player_1: Player
    player_2: Player
    player_3: Player
    player_4: Player
    player_5: Player
    igl: int


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
