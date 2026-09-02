from datetime import datetime

from pydantic import BaseModel

from schemas.user_schemas import UserOut


class AccessTokenData(BaseModel):
    id: str


class RefreshTokenData(AccessTokenData):
    jti: str


class TokenOut(BaseModel):
    user: UserOut
    access_token: str
    token_type: str


class RefreshToken(BaseModel):
    token: str
    jti: str
    expires_at: datetime


class Tokens(BaseModel):
    access_token: str
    refresh_token: str
