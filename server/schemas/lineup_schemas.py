from pydantic import BaseModel, ConfigDict

from schemas.player_schemas import Player

config = ConfigDict(from_attributes=True)


class Lineup(BaseModel):
    players: list[Player]


class LineupEvaluation(BaseModel):
    score: float
    bracket: int
    best: bool
