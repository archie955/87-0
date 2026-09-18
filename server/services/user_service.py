"""Provide service functions for users routers."""

import logging

from sqlalchemy.ext.asyncio import AsyncSession

from exceptions.app_exceptions import (
    DataAlreadyExistsError,
    DataNotFoundError,
)
from models.models import User
from schemas import user_schemas
from services.helpers import safe_commit, safe_commit_delete

logger = logging.getLogger(__name__)


async def delete(db: AsyncSession, user: User, request_id: str) -> None:
    """Delete the provided user.

    Parameters
    ----------
    db : sqlalchemy.ext.asyncio.AsyncSession
        database session
    user : models.User
        SQLAlchemy model for User table

    Returns:
    -------
    None

    """
    await db.delete(user)
    await safe_commit_delete(db, datatype="User")

    logger.info("User deleted", extra={"user_id": user.id, "request_id": request_id})


async def update(
    db: AsyncSession, user: User, updated: user_schemas.UserUpdate, request_id: str
) -> user_schemas.UserOut:
    """Update user username.

    Parameters
    ----------
    db : sqlalchemy.ext.asyncio.AsyncSession
        database session
    user : models.User
        SQLAlchemy model for User table
    updated : user_schemas.UserUpdate
        payload for user update

    Returns:
    -------
    user_schemas.UserOut
        User output details

    """
    email = user.email_login
    steam = user.steam_login

    if not email and not steam:
        raise DataNotFoundError(datatype="Email login")

    if user.username == updated.updated_username:
        raise DataAlreadyExistsError(datatype="Username")

    user.username = updated.updated_username

    await safe_commit(db=db, datatype="Username")
    await db.refresh(user)

    logger.info("Updated user", extra={"user_id": user.id, "request_id": request_id})

    return user_schemas.UserOut.model_validate(user)
