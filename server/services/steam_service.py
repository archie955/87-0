import logging

from fastapi.datastructures import QueryParams
from fastapi.responses import RedirectResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from authentication.auth import create_access_token
from exceptions.app_exceptions import (
    InvalidCredentialsError,
)
from models.models import User
from schemas import token_schemas
from services.helpers import safe_commit, safe_commit_add, safe_commit_delete
from services.steam_login import SteamLogin, SteamValidator
from utils.config import Settings

logger = logging.getLogger(__name__)


def redirect(url: str) -> RedirectResponse:
    steam = SteamLogin(url)
    logger.info("User redirected")
    return steam.redirect()


async def validate(db: AsyncSession, settings: Settings, query_params: QueryParams):
    validator = SteamValidator()
    steam_id = await validator.validate_login(query_params)

    if not steam_id or not isinstance(steam_id, str):
        raise InvalidCredentialsError()

    profile = await validator.fetch_details()

    user = (
        await db.execute(
            select(User)
            .where(User.steam_id == profile.steam_id)
            .options(selectinload(User.best_game))
        )
    ).scalar_one_or_none()

    if user is None:
        user = User(
            username=profile.username,
            url=profile.url,
            avatar=profile.avatar,
            steam_id=profile.steam_id,
        )
        db.add(user)
        await safe_commit_add(db=db, datatype="User")
        await db.refresh(user)
        id = user.id
    else:
        user.username = profile.username
        user.url = profile.url
        user.avatar = profile.avatar
        await safe_commit(db=db, datatype="User")
        await db.refresh(user)
        id = user.id

    user_data = {"sub": str(id)}

    logger.info("User logged in", extra={"user_id": str(id)})

    return token_schemas.UserToken(
        user=user,
        access_token=create_access_token(data=user_data, settings=settings),
        token_type="bearer",  # ruff: ignore[hardcoded-password-func-arg]
    )


async def delete(db: AsyncSession, user: User):
    await db.delete(user)
    await safe_commit_delete(db, datatype="User")

    logger.info("User deleted", extra={"user_id": user.id})
