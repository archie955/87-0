"""Provide service functions for users routers."""

import asyncio
import logging

from sqlalchemy.ext.asyncio import AsyncSession

from exceptions.app_exceptions import (
    DataAlreadyExistsError,
    DataNotFoundError,
    InvalidCredentialsError,
)
from models.models import User
from schemas import user_schemas
from services.helpers import safe_commit, safe_commit_delete
from utils import utils

logger = logging.getLogger(__name__)


async def delete(db: AsyncSession, user: User) -> None:
    """Delete the provided user.

    Parameters
    ----------
    db : sqlalchemy.ext.asyncio.AsyncSession
        database session
    user : models.User
        SQLAlchemy model for User table

    Returns
    -------
    None

    """
    await db.delete(user)
    await safe_commit_delete(db, datatype="User")

    logger.info("User deleted", extra={"user_id": user.id})


async def update(
    db: AsyncSession, user: User, updated: user_schemas.UserUpdate
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

    Returns
    -------
    user_schemas.UserOut
        User output details

    """
    email = user.email_login

    if not email:
        raise DataNotFoundError(datatype="Email login")

    verified = await asyncio.to_thread(
        utils.verify,
        plain_password=updated.password,
        hashed_password=email.hashed_password,
    )
    if not verified:
        raise InvalidCredentialsError()

    if user.username == updated.updated_username:
        raise DataAlreadyExistsError(datatype="Username")

    user.username = updated.updated_username

    await safe_commit(db=db, datatype="Username")
    await db.refresh(user)

    return user_schemas.UserOut.model_validate(user)
