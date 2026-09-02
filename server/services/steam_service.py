# pyrefly: ignore-errors[bad-argument-type]
import logging

from fastapi.datastructures import QueryParams
from fastapi.responses import RedirectResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from authentication.auth import create_access_token, create_refresh_token
from exceptions.app_exceptions import (
    DataAlreadyExistsError,
    DataNotFoundError,
    InvalidCredentialsError,
)
from models import models
from schemas import steam_schemas, token_schemas
from services.helpers import safe_commit, safe_commit_add, safe_commit_delete
from services.steam_login import SteamLogin, SteamValidator
from utils.config import Settings

logger = logging.getLogger(__name__)


async def check_username(db: AsyncSession, username: str) -> None:
    existing_username = (
        await db.execute(select(models.User).where(models.User.username == username))
    ).scalar_one_or_none()

    if existing_username:
        raise DataAlreadyExistsError(datatype="Username")


def redirect(return_url: str) -> RedirectResponse:
    steam = SteamLogin(return_url)

    logger.info("User redirected")

    return steam.redirect()


async def validate_profile(query_params: QueryParams) -> steam_schemas.SteamProfile:
    validator = SteamValidator()
    steam_id = await validator.validate_login(query_params)

    if not steam_id:
        raise InvalidCredentialsError()

    return await validator.fetch_details(steam_id)


async def create_steam_login(
    db: AsyncSession,
    profile: steam_schemas.SteamProfile,
    settings: Settings,
    username: str,
):
    steam_login = (
        await db.execute(
            select(models.Steam)
            .where(models.Steam.steam_id == profile.steam_id)
            .options(selectinload(models.Steam.user))
        )
    ).scalar_one_or_none()

    if steam_login is not None:
        raise DataAlreadyExistsError(datatype="Steam Login")

    user = models.User(
        username=username,
        best_score=0.0,
    )

    steam_login = models.Steam(
        profile_name=profile.profile_name,
        url=profile.url,
        avatar=profile.avatar,
        steam_id=profile.steam_id,
        user=user,
    )

    db.add(steam_login)

    await safe_commit_add(db=db, datatype="User")

    user = (
        await db.execute(select(models.User).where(models.User.username == username))
    ).scalar_one_or_none()

    if not user:
        raise DataNotFoundError(datatype="User")

    user_data = {"sub": str(user.id)}

    token = create_refresh_token(data=user_data, settings=settings)

    refresh = models.RefreshToken(
        expires_at=token.expires_at,
        jti=token.jti,
        user=user,
    )

    db.add(refresh)
    await safe_commit(db=db, datatype="Refresh Token")

    logger.info("User logged in", extra={"user_id": str(user.id)})

    return token_schemas.Tokens(
        access_token=create_access_token(data=user_data, settings=settings),
        refresh_token=token.token,
    )


async def update_steam_login(
    db: AsyncSession, profile: steam_schemas.SteamProfile, settings: Settings
):
    steam_login = (
        await db.execute(
            select(models.Steam)
            .where(models.Steam.steam_id == profile.steam_id)
            .options(
                selectinload(models.Steam.user).selectinload(models.User.steam_login)
            )
        )
    ).scalar_one_or_none()

    if steam_login is None:
        raise DataNotFoundError(datatype="Steam Login")

    user = steam_login.user

    steam_login.username = profile.profile_name
    steam_login.url = profile.url
    steam_login.avatar = profile.avatar

    await safe_commit(db=db, datatype="User")

    user_data = {"sub": str(user.id)}

    refresh = (
        await db.execute(
            select(models.RefreshToken).where(models.RefreshToken.user_id == user.id)
        )
    ).scalar_one_or_none()
    if refresh:
        await db.delete(refresh)
        await safe_commit_delete(db=db, datatype="Refresh Token")

    token = create_refresh_token(data=user_data, settings=settings)

    refresh = models.RefreshToken(
        expires_at=token.expires_at,
        jti=token.jti,
        user=user,
    )

    db.add(refresh)
    await safe_commit_add(db=db, datatype="Refresh Token")

    logger.info("User logged in", extra={"user_id": str(user.id)})

    return token_schemas.Tokens(
        access_token=create_access_token(data=user_data, settings=settings),
        refresh_token=token.token,
    )
