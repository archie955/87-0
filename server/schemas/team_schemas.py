from pydantic import BaseModel, ConfigDict, RootModel

from schemas.player_schemas import Player

config = ConfigDict(from_attributes=True)


class Team(BaseModel):
    id: int
    name: str
    players: list[Player]


class Teams(RootModel[dict[int, Team]]):
    model_config = config
    pass
