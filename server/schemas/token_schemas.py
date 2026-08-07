from pydantic import BaseModel


class UserToken(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    id: str
