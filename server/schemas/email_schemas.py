from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from schemas.base_schema import OrmModel


class EmailCreate(BaseModel):
    username: str = Field(..., max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=30)


class EmailOut(OrmModel):
    email: EmailStr
    username: str = Field(..., max_length=100)
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
