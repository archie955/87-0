import asyncio
import logging
import math
import re
from datetime import UTC, datetime, timedelta

from pydantic import EmailStr
from sqlalchemy import null, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from authentication.auth import create_access_token, create_refresh_token
from exceptions.app_exceptions import (
    BadRequestError,
    DataAlreadyExistsError,
    InvalidCredentialsError,
    LockoutError,
)
from models import models
from schemas import email_schemas, token_schemas
from services.helpers import safe_commit, safe_commit_add, safe_commit_delete
from utils import utils
from utils.config import Settings

logger = logging.getLogger(__name__)
MIN_PASSWORD_LENGTH = 6
MAX_ATTEMPTS = 3


async def lockout(email_user: models.Email, db: AsyncSession):
    email_user.attempts += 1
    if email_user.attempts >= MAX_ATTEMPTS:
        email_user.lockout = datetime.now(tz=UTC) + timedelta(hours=1)

    await safe_commit(db=db, datatype="Email Lockout")


async def create_email(
    db: AsyncSession, email_user: email_schemas.EmailCreate, settings: Settings
) -> token_schemas.Tokens:
    if not re.fullmatch(r"\S+@\S+\.\S+", email_user.email):
        # ruff: ignore[raise-vanilla-args]
        raise BadRequestError("Invalid Email provided")

    if not len(email_user.password) >= MIN_PASSWORD_LENGTH:
        # ruff: ignore[raise-vanilla-args]
        raise BadRequestError("Password is too short")

    existing_username = (
        await db.execute(
            select(models.User).where(models.User.username == email_user.username)
        )
    ).scalar_one_or_none()

    if existing_username:
        raise DataAlreadyExistsError(datatype="Username")

    existing_user = (
        await db.execute(
            select(models.Email).where(
                models.Email.email == email_user.email,
            )
        )
    ).scalar_one_or_none()

    if existing_user:
        raise DataAlreadyExistsError(datatype="Email")

    hashed_pwd = await asyncio.to_thread(utils.hash, password=email_user.password)

    user = models.User(username=email_user.username, best_score=0.0)
    email_user = models.Email(
        email=email_user.email,
        hashed_password=hashed_pwd,
        user=user,
    )

    db.add(user)
    db.add(email_user)

    await safe_commit(db=db, datatype="User")
    await db.refresh(user)

    user_data = {"sub": str(user.id)}

    token = create_refresh_token(data=user_data, settings=settings)

    refresh = models.RefreshToken(
        expires_at=token.expires_at,
        jti=token.jti,
        user=user,
    )

    db.add(refresh)
    await safe_commit(db=db, datatype="Refresh Token")

    logger.info("User created", extra={"user_id": user.id})

    return token_schemas.Tokens(
        access_token=create_access_token(data=user_data, settings=settings),
        refresh_token=token.token,
    )


async def login(
    db: AsyncSession, settings: Settings, email: EmailStr, password: str
) -> token_schemas.Tokens:
    email_user = (
        await db.execute(
            select(models.Email)
            .where(models.Email.email == email)
            .options(selectinload(models.Email.user))
        )
    ).scalar_one_or_none()

    if not email_user:
        raise InvalidCredentialsError()

    if email_user.lockout and email_user.lockout > datetime.now(tz=UTC):
        time = math.ceil(
            (email_user.lockout - datetime.now(tz=UTC)).total_seconds() / 60.0
        )
        raise LockoutError(time=time)

    verified = await asyncio.to_thread(
        utils.verify,
        plain_password=password,
        # pyrefly: ignore [bad-argument-type]
        hashed_password=email_user.hashed_password,
    )

    if not verified:
        await lockout(email_user, db)
        raise InvalidCredentialsError()

    user_data = {"sub": str(email_user.user_id)}

    refresh = (
        await db.execute(
            select(models.RefreshToken).where(
                models.RefreshToken.user_id == email_user.user_id
            )
        )
    ).scalar_one_or_none()
    if refresh:
        await db.delete(refresh)
        await safe_commit_delete(db=db, datatype="Refresh Token")

    token = create_refresh_token(data=user_data, settings=settings)

    refresh = models.RefreshToken(
        expires_at=token.expires_at,
        jti=token.jti,
        user=email_user.user,
    )

    db.add(refresh)
    email_user.attempts = 0
    email_user.lockout = null()

    await safe_commit_add(db=db, datatype="Refresh Token")

    logger.info("User logged in", extra={"user_id": email_user.user_id})

    return token_schemas.Tokens(
        access_token=create_access_token(data=user_data, settings=settings),
        refresh_token=token.token,
    )
