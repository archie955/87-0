from datetime import datetime

from pydantic import BaseModel

from schemas.base_schema import OrmModel


class SteamUser(BaseModel):
    profile_name: str
    url: str
    avatar: str


class SteamProfile(SteamUser):
    steam_id: str


class SteamOut(OrmModel):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
