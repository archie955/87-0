from services.helpers import safe_commit_delete
import asyncio
import logging

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from authentication.auth import create_access_token
from exceptions.app_exceptions import (
    BadRequestError,
    DataAlreadyExistsError,
    InvalidCredentialsError,
)
from models.models import User
from schemas import user_schemas
from services.helpers import safe_commit
from utils import utils

logger = logging.getLogger(__name__)


async def create_user(
    db: AsyncSession, user: user_schemas.UserCreate
) -> user_schemas.UserOut:
    existing_user = (
        await db.execute(
            select(User).where(
                or_(
                    User.email == user.email,
                    User.username == user.username,
                )
            )
        )
    ).scalar_one_or_none()

    if existing_user:
        raise DataAlreadyExistsError(datatype="User")

    hashed_pwd = await asyncio.to_thread(utils.hash, password=user.password)

    new_user = User(
        email=user.email,
        username=user.username,
        hashed_password=hashed_pwd,
    )

    db.add(new_user)

    await safe_commit(db=db, datatype="User")
    await db.refresh(new_user)

    logger.info("User created", extra={"user_id": new_user.id})

    return user_schemas.UserOut.model_validate(new_user)


async def login(
    db: AsyncSession, username: str, password: str
) -> user_schemas.UserToken:
    user = (
        await db.execute(
            select(User).where(or_(User.email == username, User.username == username))
        )
    ).scalar_one_or_none()

    if not user:
        raise InvalidCredentialsError()

    verified = await asyncio.to_thread(
        utils.verify,
        plain_password=password,
        # pyrefly: ignore [bad-argument-type]
        hashed_password=user.hashed_password,
    )

    if not verified:
        raise InvalidCredentialsError()

    user_data = {"sub": str(user.id)}

    logger.info("User logged in", extra={"user_id": user.id})

    return user_schemas.UserToken(
        user=user_schemas.UserOut.model_validate(user),
        access_token=create_access_token(data=user_data),
        token_type="bearer",  # ruff: ignore[hardcoded-password-func-arg]
    )


async def update(
    db: AsyncSession, user: User, updated: user_schemas.UserUpdate
) -> user_schemas.UserOut:
    # pyrefly: ignore [bad-argument-type]
    verified = await asyncio.to_thread(
        utils.verify,
        plain_password=updated.password,
        # pyrefly: ignore [bad-argument-type]
        hashed_password=user.hashed_password,
    )
    if not verified:
        raise InvalidCredentialsError()

    updated_user = updated.updated_user

    updated_verified = await asyncio.to_thread(
        utils.verify,
        plain_password=updated_user.password,
        # pyrefly: ignore [bad-argument-type]
        hashed_password=user.hashed_password,
    )

    if (
        user.email == updated_user.email
        and updated_verified
        and user.username == updated_user.username
    ):
        raise BadRequestError(message="No new information provided, nothing updated")

    user.email = updated_user.email
    user.username = updated_user.username
    user.hashed_password = await asyncio.to_thread(
        utils.hash, password=updated_user.password
    )

    await safe_commit(db, datatype="User")
    await db.refresh(user)

    logger.info("User updated", extra={"user_id": user.id})

    return user_schemas.UserOut.model_validate(user)


async def delete(db: AsyncSession, user: User):
    await db.delete(user)
    await safe_commit_delete(db, datatype="User")

    logger.info("User deleted", extra={"user_id": user.id})
