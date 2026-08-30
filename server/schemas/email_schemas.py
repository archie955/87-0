from datetime import datetime

from pydantic import BaseModel, EmailStr

from schemas.base_schema import OrmModel


class EmailCreate(BaseModel):
    username: str
    email: EmailStr
    password: str


class EmailOut(OrmModel):
    email: EmailStr
    username: str
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime


class EmailUser(OrmModel):
    email: EmailStr
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime


class EmailUpdate(BaseModel):
    updated_password: str
    password: str
