from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr

config = ConfigDict(from_attributes=True)


class UserBase(BaseModel):
    email: EmailStr
    username: str


class UserCreate(UserBase):
    password: str


class UserOut(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime
    model_config = config


class UserUpdate(BaseModel):
    updated_user: UserCreate
    password: str


class UserToken(BaseModel):
    user: UserOut
    access_token: str
    token_type: str
