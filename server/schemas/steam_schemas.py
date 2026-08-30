from datetime import datetime

from pydantic import BaseModel

from schemas.base_schema import OrmModel


class SteamCreate(BaseModel):
    username: str


class SteamProfile(BaseModel):
    profile_name: str
    url: str
    avatar: str
    steam_id: str


class SteamOut(OrmModel):
    id: int
    user_id: int
    username: str
    profile_name: str
    created_at: datetime
    updated_at: datetime


class SteamUser(OrmModel):
    id: int
    user_id: int
    profile_name: str
    created_at: datetime
    updated_at: datetime
