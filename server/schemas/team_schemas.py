from pydantic import BaseModel, Field, RootModel

from schemas.base_schema import OrmModel
from schemas.player_schemas import Player


class Team(BaseModel):
    id: int
    name: str = Field(..., max_length=100)
    players: list[Player]


class Teams(RootModel[dict[int, Team]], OrmModel):
    pass
