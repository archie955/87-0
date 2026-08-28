from datetime import datetime

from pydantic import BaseModel

from schemas.base_schema import OrmModel
from schemas.email_schemas import EmailOut
from schemas.steam_schemas import SteamOut


class UserBase(BaseModel):
    pass


class UserCreate(UserBase):
    password: str


class UserOut(OrmModel):
    id: int
    best_score: float | None = None
    steam: SteamOut | None = None
    email: EmailOut | None = None
    created_at: datetime
    updated_at: datetime


class UserUpdate(BaseModel):
    updated_user: UserCreate
    password: str


class UserToken(BaseModel):
    user: UserOut
    access_token: str
    token_type: str
