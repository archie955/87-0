from models.enums import Roles
from schemas.base_schema import OrmModel


class Player(OrmModel):
    id: int
    team_id: int
    name: str
    role: Roles
    hltv: float
    igl_bonus: float


class TeamPlayers(OrmModel):
    players: list[Player]


class AltTeamPlayers(TeamPlayers):
    team_id: int
