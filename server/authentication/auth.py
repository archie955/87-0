import uuid
from datetime import UTC, datetime, timedelta
from typing import Annotated, Any

import jwt
from fastapi import Depends, Request
from fastapi.security.oauth2 import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from database.database import DBDep
from exceptions.app_exceptions import InvalidCredentialsError
from models.models import User
from schemas import token_schemas
from utils.config import Settings, SettingsDep

CREDENTIALS_EXCEPTION = InvalidCredentialsError()


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/email/login")
optional_oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/email/login", auto_error=False)

BearerDep = Annotated[str, Depends(oauth2_scheme)]
OptionalBearerDep = Annotated[str | None, Depends(optional_oauth2_scheme)]


def create_access_token(data: dict, settings: Settings) -> str:
    to_encode = data.copy()

    expire = datetime.now(UTC) + timedelta(minutes=settings.access_token_expire_minutes)
    to_encode.update({"exp": expire, "type": "access"})

    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)


def create_refresh_token(data: dict, settings: Settings) -> token_schemas.RefreshToken:
    to_encode = data.copy()

    expire = datetime.now(UTC) + timedelta(days=settings.refresh_token_expire_days)
    jti = str(uuid.uuid4())
    to_encode.update({"exp": expire, "type": "refresh", "jti": jti})

    return token_schemas.RefreshToken(
        token=jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm),
        jti=jti,
        expires_at=expire,
    )


def decode_token(token: str, settings: Settings) -> dict[str, Any]:
    try:
        return jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
    except jwt.exceptions.InvalidTokenError as e:
        raise CREDENTIALS_EXCEPTION from e


def verify_access_token(
    token: str, settings: Settings
) -> token_schemas.AccessTokenData:
    payload = decode_token(token, settings)

    if payload.get("type") != "access":
        raise CREDENTIALS_EXCEPTION

    user_id = payload.get("sub")

    if user_id is None:
        raise CREDENTIALS_EXCEPTION

    return token_schemas.AccessTokenData(id=user_id)


def verify_refresh_token(
    token: str, settings: Settings
) -> token_schemas.RefreshTokenData:
    payload = decode_token(token, settings)

    if payload.get("type") != "refresh":
        raise CREDENTIALS_EXCEPTION

    user_id = payload.get("sub")
    jti = payload.get("jti")

    if user_id is None or jti is None:
        raise CREDENTIALS_EXCEPTION

    return token_schemas.RefreshTokenData(id=user_id, jti=jti)


async def get_current_user(request: Request, db: DBDep, settings: SettingsDep) -> User:
    access_token = request.cookies.get("access_token")
    if not access_token:
        raise CREDENTIALS_EXCEPTION

    user_id_token = verify_access_token(token=access_token, settings=settings)

    user = (
        await db.execute(
            select(User)
            .where(User.id == int(user_id_token.id))
            .options(
                selectinload(User.steam_login),
                selectinload(User.email_login),
            )
        )
    ).scalar_one_or_none()

    if not user:
        raise CREDENTIALS_EXCEPTION

    return user


async def get_current_user_or_null(
    request: Request, db: DBDep, settings: SettingsDep
) -> User | None:
    access_token = request.cookies.get("access_token")
    if not access_token:
        return None

    user_id_token = verify_access_token(token=access_token, settings=settings)

    user = (
        await db.execute(
            select(User)
            .where(User.id == int(user_id_token.id))
            .options(
                selectinload(User.steam_login),
                selectinload(User.email_login),
            )
        )
    ).scalar_one_or_none()

    if not user:
        raise CREDENTIALS_EXCEPTION

    return user


UserDep = Annotated[User, Depends(get_current_user)]
NullableUserDep = Annotated[User | None, Depends(get_current_user_or_null)]
