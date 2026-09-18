from datetime import datetime

from pydantic import BaseModel, Field

from schemas.base_schema import OrmModel


class SteamCreate(BaseModel):
    username: str = Field(..., max_length=100)


class SteamProfile(BaseModel):
    profile_name: str = Field(..., max_length=200)
    url: str = Field(..., max_length=200)
    avatar: str = Field(..., max_length=200)
    steam_id: str = Field(..., max_length=17)


class SteamOut(OrmModel):
    id: int
    user_id: int
    username: str = Field(..., max_length=100)
    profile_name: str = Field(..., max_length=200)
    created_at: datetime
    updated_at: datetime


class SteamUser(OrmModel):
    id: int
    user_id: int
    profile_name: str = Field(..., max_length=200)
    created_at: datetime
    updated_at: datetime
