import asyncio
import logging

from pydantic import EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from authentication.auth import create_access_token
from exceptions.app_exceptions import (
    BadRequestError,
    DataAlreadyExistsError,
    DataNotFoundError,
    InvalidCredentialsError,
    RequiredAuthentication,
)
from models import models
from schemas import email_schemas, token_schemas, user_schemas
from services.helpers import safe_commit, safe_commit_add, safe_commit_delete
from utils import utils
from utils.config import Settings

logger = logging.getLogger(__name__)


async def create_email(
    db: AsyncSession, email_user: email_schemas.EmailCreate
) -> email_schemas.EmailOut:
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
        email=email_user.email,
        hashed_password=hashed_pwd,
        user=user,
    )

    db.add(user)
    db.add(email_user)

    await safe_commit(db=db, datatype="User")
    await db.refresh(email_user)

    logger.info("User created", extra={"user_id": user.id})

    return email_schemas.EmailOut.model_validate(email_user)


async def add_email_login_to_preexisting_account(
    db: AsyncSession, email_profile: email_schemas.EmailCreate, user: models.User
) -> email_schemas.EmailOut:
    if user.email_login:
        raise DataAlreadyExistsError(datatype="Email Login")

    if not user.steam_login:
        raise BadRequestError(message="Account not authenticated")

    hashed_pwd = await asyncio.to_thread(utils.hash, email_profile.password)

    email_login = models.Email(
        email=email_profile.email,
        hashed_password=hashed_pwd,
        user=user,
    )

    db.add(email_login)

    await safe_commit_add(db=db, datatype="User")

    await db.refresh(email_login)

    logger.info("Added email login", extra={"user_id": str(user.id)})

    return email_schemas.EmailOut.model_validate(email_login)


async def login(
    db: AsyncSession, settings: Settings, email: EmailStr, password: str
) -> token_schemas.TokenOut:
    email_user = (
        await db.execute(
            select(models.Email)
            .where(models.Email.email == email)
            .options(
                selectinload(models.Email.user).selectinload(models.User.email_login),
                selectinload(models.Email.user).selectinload(models.User.steam_login),
            )
        )
    ).scalar_one_or_none()

    if not email_user:
        raise InvalidCredentialsError()

    verified = await asyncio.to_thread(
        utils.verify,
        plain_password=password,
        # pyrefly: ignore [bad-argument-type]
        hashed_password=email_user.hashed_password,
    )

    if not verified:
        raise InvalidCredentialsError()

    user_data = {"sub": str(email_user.user_id)}

    logger.info("User logged in", extra={"user_id": email_user.user_id})

    user = email_user.user

    return token_schemas.TokenOut(
        user=user_schemas.UserOut.model_validate(user),
        access_token=create_access_token(data=user_data, settings=settings),
        token_type="bearer",  # ruff: ignore[hardcoded-password-func-arg]
    )


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


async def delete(db: AsyncSession, user: models.User) -> None:
    if not user.email_login:
        raise DataNotFoundError(datatype="Email Login")

    if not user.steam_login:
        raise RequiredAuthentication()

    email_user = user.email_login

    await db.delete(email_user)
    await safe_commit_delete(db, datatype="Email Login")

    logger.info("email User deleted", extra={"email_user_id": email_user.id})

    logger.info("Associated user remains", extra={"user_id": user.id})
