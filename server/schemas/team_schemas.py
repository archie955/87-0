from pydantic import BaseModel, ConfigDict

from schemas.player_schemas import Player

config = ConfigDict(from_attributes=True)


class Team(BaseModel):
    id: int
    name: str
    players: list[Player]


class Teams(BaseModel):
    teams: list[Team]
