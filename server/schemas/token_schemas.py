from datetime import datetime

from pydantic import BaseModel, Field

from schemas.user_schemas import UserOut


class AccessTokenData(BaseModel):
    id: str


class RefreshTokenData(AccessTokenData):
    jti: str = Field(..., max_length=200)


class TokenOut(BaseModel):
    user: UserOut
    access_token: str
    token_type: str


class RefreshToken(BaseModel):
    token: str
    jti: str = Field(..., max_length=200)
    expires_at: datetime


class Tokens(BaseModel):
    access_token: str
    refresh_token: str
