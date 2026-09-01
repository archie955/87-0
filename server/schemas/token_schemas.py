from datetime import datetime

from pydantic import BaseModel

from schemas.user_schemas import UserOut


class TokenData(BaseModel):
    id: str


class TokenOut(BaseModel):
    user: UserOut
    access_token: str
    token_type: str


class RefreshTokenData(TokenData):
    pass


class RefreshToken(BaseModel):
    token: str
    expiry: datetime
