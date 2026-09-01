# pyrefly: ignore-errors[bad-argument-type]
import logging

from fastapi.datastructures import QueryParams
from fastapi.responses import RedirectResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from authentication.auth import create_access_token
from exceptions.app_exceptions import (
    BadRequestError,
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

    logger.info("User logged in", extra={"user_id": str(user.id)})

    return token_schemas.TokenOut(
        user=user,
        access_token=create_access_token(data=user_data, settings=settings),
        token_type="bearer",  # ruff: ignore[hardcoded-password-func-arg]
    )


async def update_steam_login(
    db: AsyncSession, profile: steam_schemas.SteamProfile, settings: Settings
):
    steam_login = (
        await db.execute(
            select(models.Steam)
            .where(models.Steam.steam_id == profile.steam_id)
            .options(selectinload(models.Steam.user))
        )
    ).scalar_one_or_none()

    if steam_login is None:
        raise DataNotFoundError(datatype="Steam Login")

    user = steam_login.user

    steam_login.username = profile.profile_name
    steam_login.url = profile.url
    steam_login.avatar = profile.avatar

    await safe_commit(db=db, datatype="User")

    await db.refresh(steam_login)

    user_data = {"sub": str(user.id)}

    logger.info("User logged in", extra={"user_id": str(user.id)})

    return token_schemas.TokenOut(
        user=user,
        access_token=create_access_token(data=user_data, settings=settings),
        token_type="bearer",  # ruff: ignore[hardcoded-password-func-arg]
    )


async def add_steam_login_to_preexisting_account(
    db: AsyncSession, profile: steam_schemas.SteamProfile, user: models.User
) -> steam_schemas.SteamOut:
    if user.steam_login:
        raise DataAlreadyExistsError(datatype="Steam Login")

    if not user.email_login:
        raise BadRequestError(message="Account not authenticated")

    steam_login = models.Steam(
        profile_name=profile.profile_name,
        url=profile.url,
        avatar=profile.avatar,
        steam_id=profile.steam_id,
        user=user,
    )

    db.add(steam_login)

    await safe_commit_add(db=db, datatype="User")

    await db.refresh(steam_login)

    logger.info("Added steam login", extra={"user_id": str(user.id)})

    return steam_schemas.SteamOut.model_validate(steam_login)


async def delete(db: AsyncSession, user: models.User) -> None:
    if not user.email_login:
        raise BadRequestError(
            message="Cannot delete only authentication method for account"
        )

    if not user.steam_login:
        raise DataNotFoundError(datatype="Steam Login")

    steam_user = user.steam_login

    await db.delete(steam_user)
    await safe_commit_delete(db, datatype="Steam Login")

    logger.info("Steam User deleted", extra={"steam_user_id": steam_user.id})

    logger.info("Associated user remains", extra={"user_id": user.id})
