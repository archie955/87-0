import pytest
from pydantic import ValidationError
from sqlalchemy import select

from exceptions.app_exceptions import (
    DataAlreadyExistsError,
    InvalidCredentialsError,
)
from models import models
from models.models import Email, User
from schemas import email_schemas
from services import email_service
from tests.service_helpers import create_email_user
from utils.config import get_settings

settings = get_settings()


async def test_create_email_success(db):
    payload = email_schemas.EmailCreate(
        username="newuser",
        email="new@example.com",
        password="password",
    )

    tokens = await email_service.create_email(
        db=db,
        email_user=payload,
        settings=settings,
    )

    assert tokens.access_token
    assert tokens.refresh_token

    user = (
        await db.execute(select(User).where(User.username == "newuser"))
    ).scalar_one()

    assert user.best_score == 0.0

    email = (
        await db.execute(select(Email).where(Email.user_id == user.id))
    ).scalar_one()

    assert email.email == "new@example.com"


async def test_create_email_duplicate_username(db):
    await create_email_user(
        db,
        username="dupuser",
        email="dup1@example.com",
    )

    payload = email_schemas.EmailCreate(
        username="dupuser",
        email="dup2@example.com",
        password="password",
    )

    with pytest.raises(DataAlreadyExistsError):
        await email_service.create_email(
            db=db,
            email_user=payload,
            settings=settings,
        )


async def test_create_email_duplicate_email(db):
    await create_email_user(
        db,
        username="dupemailuser",
        email="dup@example.com",
    )

    payload = email_schemas.EmailCreate(
        username="newuser",
        email="dup@example.com",
        password="password",
    )

    with pytest.raises(DataAlreadyExistsError):
        await email_service.create_email(
            db=db,
            email_user=payload,
            settings=settings,
        )


def test_create_email_small_password():
    with pytest.raises(ValidationError):
        email_schemas.EmailCreate(
            username="newuser",
            email="new@example.com",
            password="short",
        )


def test_create_email_invalid_email(db):
    with pytest.raises(ValidationError):
        email_schemas.EmailCreate(
            username="newuser",
            email="newexamplecom",
            password="password",
        )


async def test_login_success(db):
    await create_email_user(
        db,
        username="loginuser",
        email="login@example.com",
        password="password",
    )

    tokens = await email_service.login(
        db=db,
        settings=settings,
        email="login@example.com",
        password="password",
    )

    assert tokens.access_token
    assert tokens.refresh_token


async def test_login_wrong_password(db):
    await create_email_user(
        db,
        username="wrongpass",
        email="wrongpass@example.com",
        password="password",
    )

    with pytest.raises(InvalidCredentialsError):
        await email_service.login(
            db=db,
            settings=settings,
            email="wrongpass@example.com",
            password="wrong",
        )


async def test_login_unknown_email(db):
    with pytest.raises(InvalidCredentialsError):
        await email_service.login(
            db=db,
            settings=settings,
            email="unknown@example.com",
            password="password",
        )


async def test_login_rotates_refresh_token(db):
    await create_email_user(
        db,
        username="rotateuser",
        email="rotate@example.com",
        password="password",
    )

    first = await email_service.login(
        db=db,
        settings=settings,
        email="rotate@example.com",
        password="password",
    )

    second = await email_service.login(
        db=db,
        settings=settings,
        email="rotate@example.com",
        password="password",
    )

    assert first.refresh_token != second.refresh_token

    rows = (await db.execute(select(models.RefreshToken))).scalars().all()

    assert len(rows) == 1
