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
from models.user_model import User
from routers.steam_login import SteamLogin, SteamValidator
from schemas import token_schemas
from services.helpers import safe_commit, safe_commit_add

logger = logging.getLogger(__name__)


def redirect(url: str) -> RedirectResponse:
    steam = SteamLogin(url)
    logger.info("User redirected")
    return steam.Redirect()


async def validate(db: AsyncSession, query_params: QueryParams):
    validator = SteamValidator()
    steamID = validator.ValidateLogin(query_params)

    if not steamID or not isinstance(steamID, str):
        raise InvalidCredentialsError()

    profile = validator.FetchDetails()

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
        access_token=create_access_token(data=user_data),
        token_type="bearer",
    )


async def delete(db: AsyncSession, user: User):
    await db.delete(user)
    await db.commit()

    logger.info("User deleted", extra={"user_id": user.id})

    return
