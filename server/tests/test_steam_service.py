import pytest
from sqlalchemy import select

from exceptions.steam_exceptions import (
    SteamDataAlreadyExistsError,
    SteamDataNotFoundError,
)
from models.models import Steam, User
from schemas import steam_schemas
from services import steam_service
from tests.service_helpers import create_email_user
from utils.config import get_settings

settings = get_settings()


async def test_check_username_available(db):
    await steam_service.check_username(db=db, username="available")


async def test_check_username_taken(db):
    await create_email_user(
        db,
        username="taken",
        email="taken@example.com",
    )

    with pytest.raises(SteamDataAlreadyExistsError):
        await steam_service.check_username(db=db, username="taken")


def test_redirect_returns_steam_url():
    response = steam_service.redirect("http://example.com/return", state="state")

    assert response.status_code == 303
    assert response.headers["location"].startswith(
        "https://steamcommunity.com/openid/login?"
    )


async def test_create_steam_login_success(db):
    profile = steam_schemas.SteamProfile(
        profile_name="s1mple",
        url="https://steamcommunity.com/id/s1mple/",
        avatar="https://avatars.steamstatic.com/s1mple.jpg",
        steam_id="76561197960287930",
    )

    tokens = await steam_service.create_steam_login(
        db=db,
        profile=profile,
        settings=settings,
        username="steamuser",
    )

    assert tokens.access_token
    assert tokens.refresh_token

    user = (
        await db.execute(select(User).where(User.username == "steamuser"))
    ).scalar_one()

    steam = (
        await db.execute(select(Steam).where(Steam.user_id == user.id))
    ).scalar_one()

    assert steam.steam_id == profile.steam_id
    assert steam.profile_name == profile.profile_name


async def test_create_steam_login_duplicate_steam_id(db):
    profile = steam_schemas.SteamProfile(
        profile_name="s1mple",
        url="https://steamcommunity.com/id/s1mple/",
        avatar="https://avatars.steamstatic.com/s1mple.jpg",
        steam_id="76561197960287930",
    )

    await steam_service.create_steam_login(
        db=db,
        profile=profile,
        settings=settings,
        username="first",
    )

    with pytest.raises(SteamDataAlreadyExistsError):
        await steam_service.create_steam_login(
            db=db,
            profile=profile,
            settings=settings,
            username="second",
        )


async def test_update_steam_login_success(db):
    profile = steam_schemas.SteamProfile(
        profile_name="old",
        url="https://steamcommunity.com/id/old/",
        avatar="https://avatars.steamstatic.com/old.jpg",
        steam_id="76561197960287930",
    )

    await steam_service.create_steam_login(
        db=db,
        profile=profile,
        settings=settings,
        username="updateuser",
    )

    new_profile = steam_schemas.SteamProfile(
        profile_name="new",
        url="https://steamcommunity.com/id/new/",
        avatar="https://avatars.steamstatic.com/new.jpg",
        steam_id=profile.steam_id,
    )

    tokens = await steam_service.update_steam_login(
        db=db,
        profile=new_profile,
        settings=settings,
    )

    assert tokens.access_token

    steam = (
        await db.execute(select(Steam).where(Steam.steam_id == profile.steam_id))
    ).scalar_one()

    assert steam.profile_name == "new"


async def test_update_steam_login_unknown(db):
    profile = steam_schemas.SteamProfile(
        profile_name="unknown",
        url="https://steamcommunity.com/id/unknown/",
        avatar="https://avatars.steamstatic.com/unknown.jpg",
        steam_id="76561197960287930",
    )

    with pytest.raises(SteamDataNotFoundError):
        await steam_service.update_steam_login(
            db=db,
            profile=profile,
            settings=settings,
        )
