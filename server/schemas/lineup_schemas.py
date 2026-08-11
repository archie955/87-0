from pydantic import BaseModel, ConfigDict

from schemas.player_schemas import Player

config = ConfigDict(from_attributes=True)


class LineupPlayer(Player):
    igl: bool


class Lineup(BaseModel):
    players: list[LineupPlayer]


class LineupEvaluationNoUser(BaseModel):
    score: float
    bracket: int


class LineupEvaluation(LineupEvaluationNoUser):
    score: float
    bracket: int
    best: bool
