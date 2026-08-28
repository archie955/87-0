import asyncio
import logging

from pydantic import EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from authentication.auth import create_access_token
from exceptions.app_exceptions import (
    BadRequestError,
    DataAlreadyExistsError,
    DataNotFoundError,
    InvalidCredentialsError,
)
from models import models
from schemas import email_schemas, token_schemas, user_schemas
from services.helpers import safe_commit, safe_commit_delete
from utils import utils
from utils.config import Settings

logger = logging.getLogger(__name__)


async def create_email(
    db: AsyncSession, email_user: email_schemas.EmailCreate, settings: Settings
) -> token_schemas.TokenOut:
    existing_user = (
        await db.execute(
            select(models.Email).where(
                models.Email.email == email_user.email,
            )
        )
    ).scalar_one_or_none()

    if existing_user:
        raise DataAlreadyExistsError(datatype="User")

    hashed_pwd = await asyncio.to_thread(utils.hash, password=email_user.password)

    user = models.User(best_score=0.0)
    email_user = models.Email(
        email=user.email,
        hashed_password=hashed_pwd,
        user=user,
    )

    db.add(user)
    db.add(email_user)

    await safe_commit(db=db, datatype="User")
    await db.refresh(email_user)

    user = email_user.user

    user_data = {"sub": str(user.id)}

    logger.info("User created", extra={"user_id": email_user.id})

    return token_schemas.TokenOut(
        user=email_user.user,
        access_token=create_access_token(data=user_data, settings=settings),
        token_type="bearer",  # ruff: ignore[hardcoded-password-func-arg]
    )


async def login(
    db: AsyncSession, settings: Settings, email: EmailStr, password: str
) -> token_schemas.TokenOut:
    user = (
        await db.execute(select(models.Email).where(models.Email.email == email))
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

    return token_schemas.TokenOut(
        user=user_schemas.UserOut.model_validate(user),
        access_token=create_access_token(data=user_data, settings=settings),
        token_type="bearer",  # ruff: ignore[hardcoded-password-func-arg]
    )


async def delete(db: AsyncSession, user: models.User) -> None:
    if not user.steam_login:
        raise BadRequestError(
            message="Cannot delete only authentication method for account"
        )

    if not user.email_login:
        raise DataNotFoundError(datatype="Email Login")

    email_user = user.email_login

    await db.delete(email_user)
    await safe_commit_delete(db, datatype="Email Login")

    logger.info("email User deleted", extra={"email_user_id": email_user.id})

    logger.info("Associated user remains", extra={"user_id": user.id})


async def update(
    db: AsyncSession, user: models.Email, updated: email_schemas.EmailUpdate
) -> email_schemas.EmailOut:
    verified = await asyncio.to_thread(
        utils.verify,
        plain_password=updated.password,
        # pyrefly: ignore [bad-argument-type]
        hashed_password=user.hashed_password,
    )
    if not verified:
        raise InvalidCredentialsError()

    user.hashed_password = await asyncio.to_thread(
        utils.hash, password=updated.updated_password
    )

    await safe_commit(db=db, datatype="Email password")
    await db.refresh(user)

    logger.info("Email login updated", extra={"user_id": user.user_id})

    return email_schemas.EmailOut.model_validate(user)
