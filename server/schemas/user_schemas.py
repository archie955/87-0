from datetime import datetime

from pydantic import BaseModel, EmailStr

from schemas.base_schema import OrmModel


class UserBase(BaseModel):
    email: EmailStr
    username: str


class UserCreate(UserBase):
    password: str


class UserOut(UserBase, OrmModel):
    id: int
    best_score: float | None = None
    created_at: datetime
    updated_at: datetime


class UserUpdate(BaseModel):
    updated_user: UserCreate
    password: str


class UserToken(BaseModel):
    user: UserOut
    access_token: str
    token_type: str
