from pydantic import BaseModel, ConfigDict

from schemas.player_schemas import Team_Players

config = ConfigDict(from_attributes=True)


class Team(BaseModel):
    id: int
    name: str
    players: Team_Players


class Teams(BaseModel):
    team_1: Team
    team_2: Team
    team_3: Team
    team_4: Team
    team_5: Team
    team_6: Team
