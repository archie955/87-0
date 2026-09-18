from datetime import datetime

from pydantic import BaseModel, Field

from schemas.base_schema import OrmModel
from schemas.email_schemas import EmailUser
from schemas.steam_schemas import SteamUser


class UserOut(OrmModel):
    id: int
    username: str = Field(..., max_length=100)
    best_score: float | None = None
    steam_login: SteamUser | None = None
    email_login: EmailUser | None = None
    created_at: datetime
    updated_at: datetime


class UserUpdate(BaseModel):
    updated_username: str = Field(..., max_length=100)
