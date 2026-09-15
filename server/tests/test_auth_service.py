from datetime import timedelta

import pytest
from fastapi import Response
from sqlalchemy import select

from exceptions.app_exceptions import InvalidCredentialsError
from models.models import RefreshToken
from schemas import token_schemas
from services import auth_service
from tests.service_helpers import (
    create_email_user,
    create_refresh_token_for_user,
    request_with_cookies,
)
from utils.config import get_settings

settings = get_settings()


def test_set_cookie_headers():
    response = Response()
    tokens = token_schemas.Tokens(access_token="access", refresh_token="refresh")

    result = auth_service.set_cookie_headers(
        response=response,
        tokens=tokens,
        settings=settings,
    )

    assert result is response

    set_cookies = response.headers.getlist("set-cookie")

    assert any(h.startswith("access_token=access") for h in set_cookies)
    assert any(h.startswith("refresh_token=refresh") for h in set_cookies)
    assert all("HttpOnly" in h for h in set_cookies)


def test_clear_cookie_headers():
    response = Response()

    result = auth_service.clear_cookie_headers(
        response=response,
        settings=settings,
    )

    assert result is response

    set_cookies = response.headers.getlist("set-cookie")

    assert any(h.startswith("access_token=") and "Max-Age=0" in h for h in set_cookies)
    assert any(h.startswith("refresh_token=") and "Max-Age=0" in h for h in set_cookies)


async def test_refresh_success(db):
    user, _ = await create_email_user(
        db,
        username="refreshuser",
        email="refresh@example.com",
    )
    token, old_refresh = await create_refresh_token_for_user(db, user)

    request = request_with_cookies(refresh_token=token.token)

    tokens = await auth_service.refresh(
        request=request,
        settings=settings,
        db=db,
    )

    assert tokens.access_token
    assert tokens.refresh_token
    assert tokens.refresh_token != token.token

    rows = (await db.execute(select(RefreshToken))).scalars().all()

    assert len(rows) == 1
    assert rows[0].jti != old_refresh.jti


async def test_refresh_without_cookie(db):
    request = request_with_cookies()

    with pytest.raises(InvalidCredentialsError):
        await auth_service.refresh(
            request=request,
            settings=settings,
            db=db,
        )


async def test_refresh_with_expired_token(db):
    user, _ = await create_email_user(
        db,
        username="expireduser",
        email="expired@example.com",
    )
    token, refresh = await create_refresh_token_for_user(db, user)

    refresh.expires_at -= timedelta(days=10)
    await db.commit()

    request = request_with_cookies(refresh_token=token.token)

    with pytest.raises(InvalidCredentialsError):
        await auth_service.refresh(
            request=request,
            settings=settings,
            db=db,
        )


async def test_logout_removes_refresh_token(db):
    user, _ = await create_email_user(
        db,
        username="logoutuser",
        email="logout@example.com",
    )
    token, _ = await create_refresh_token_for_user(db, user)

    request = request_with_cookies(refresh_token=token.token)

    await auth_service.logout(
        request=request,
        db=db,
        settings=settings,
    )

    rows = (await db.execute(select(RefreshToken))).scalars().all()

    assert rows == []


async def test_logout_no_cookie_is_noop(db):
    request = request_with_cookies()

    await auth_service.logout(
        request=request,
        db=db,
        settings=settings,
    )


async def test_logout_garbage_cookie_is_noop(db):
    request = request_with_cookies(refresh_token="garbage")

    await auth_service.logout(
        request=request,
        db=db,
        settings=settings,
    )
