from pydantic import BaseModel, RootModel

from schemas.base_schema import OrmModel
from schemas.player_schemas import Player


class Team(BaseModel):
    id: int
    name: str
    players: list[Player]


class Teams(RootModel[dict[int, Team]], OrmModel):
    pass
