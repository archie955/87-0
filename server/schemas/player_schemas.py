from pydantic import BaseModel, ConfigDict

from models.enums import Roles

config = ConfigDict(from_attributes=True)


class Player(BaseModel):
    id: int
    team_id: int
    name: str
    role: Roles
    hltv: float
    igl_bonus: float
    model_config = config


class TeamPlayers(BaseModel):
    players: list[Player]
    model_config = config


class AltTeamPlayers(TeamPlayers):
    team_id: int
    model_config = config
