from datetime import UTC, datetime, timedelta
from typing import Annotated, Any

import jwt
from fastapi import Depends
from fastapi.security.oauth2 import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from database.database import DBDep
from exceptions.app_exceptions import InvalidCredentialsError
from models.models import User
from schemas import token_schemas
from utils.config import Settings, SettingsDep

CREDENTIALS_EXCEPTION = InvalidCredentialsError(headers={"WWW-Authenticate": "Bearer"})

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/users/login")

BearerDep = Annotated[str, Depends(oauth2_scheme)]


def create_access_token(data: dict, settings: Settings) -> str:
    to_encode = data.copy()

    expire = datetime.now(UTC) + timedelta(minutes=settings.access_token_expire_minutes)
    to_encode.update({"exp": expire, "type": "access"})

    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)


def decode_token(token: str, settings: Settings) -> dict[str, Any]:
    try:
        return jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
    except jwt.exceptions.InvalidTokenError as e:
        raise CREDENTIALS_EXCEPTION from e


def verify_access_token(token: str, settings: Settings) -> token_schemas.TokenData:
    payload = decode_token(token, settings)

    if payload.get("type") != "access":
        raise CREDENTIALS_EXCEPTION

    user_id = payload.get("sub")

    if user_id is None:
        raise CREDENTIALS_EXCEPTION

    return token_schemas.TokenData(id=user_id)


async def get_current_user(token: BearerDep, db: DBDep, settings: SettingsDep) -> User:
    user_id_token = verify_access_token(token=token, settings=settings)

    user = (
        await db.execute(
            select(User)
            .where(User.id == int(user_id_token.id))
            .options(selectinload(User.steam_login, User.email_login, User.best_score))
        )
    ).scalar_one_or_none()

    if not user:
        raise CREDENTIALS_EXCEPTION

    return user


UserDep = Annotated[User, Depends(get_current_user)]
