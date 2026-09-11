import httpx
import pytest
import respx
from sqlalchemy import select

from exceptions.steam_exceptions import (
    SteamBadRequestError,
    SteamDataNotFoundError,
    SteamInvalidCredentialsError,
    SteamPermissionDeniedError,
)
from models.models import Steam, User
from services.steam_login import BASEURL, FETCHURL, SteamValidator

STEAM_ID = "76561197960287930"
IDENTITY = f"https://steamcommunity.com/openid/id/{STEAM_ID}"

VALID_OPENID_PARAMS = {
    "openid.ns": "http://specs.openid.net/auth/2.0",
    "openid.mode": "id_res",
    "openid.op_endpoint": "https://steamcommunity.com/openid/login",
    "openid.claimed_id": IDENTITY,
    "openid.identity": IDENTITY,
    "openid.return_to": "http://test/steam/login/validate",
    "openid.response_nonce": "2026-01-01T00:00:00Zsomenonce",
    "openid.assoc_handle": "1234567890",
    "openid.signed": "signed,fields,here",
    "openid.sig": "fakesignature==",
}


def steam_player_payload(
    steam_id: str = STEAM_ID,
    persona_name: str = "s1mple",
    profile_url: str = "https://steamcommunity.com/id/s1mple/",
    avatar: str = "https://avatars.steamstatic.com/s1mple.jpg",
) -> dict:
    return {
        "response": {
            "players": [
                {
                    "steamid": steam_id,
                    "personaname": persona_name,
                    "profileurl": profile_url,
                    "avatar": avatar,
                }
            ]
        }
    }


def mock_openid_verify(is_valid: bool = True) -> respx.Route:
    body = "ns:http://specs.openid.net/auth/2.0\nis_valid:" + (
        "true" if is_valid else "false"
    )
    return respx.get(BASEURL).mock(return_value=httpx.Response(200, text=body))


def mock_player_summary(**payload_kwargs) -> respx.Route:
    return respx.get(FETCHURL).mock(
        return_value=httpx.Response(200, json=steam_player_payload(**payload_kwargs))
    )


# ---------------------------------------------------------------------------
# SteamValidator.validate_login
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_validate_login_success():
    with respx.mock:
        mock_openid_verify(is_valid=True)
        steam_id = await SteamValidator().validate_login(VALID_OPENID_PARAMS)

    assert steam_id == STEAM_ID


@pytest.mark.asyncio
@pytest.mark.parametrize("missing_param", list(VALID_OPENID_PARAMS.keys()))
async def test_validate_login_rejects_missing_param(missing_param):
    params = {k: v for k, v in VALID_OPENID_PARAMS.items() if k != missing_param}

    with pytest.raises(SteamInvalidCredentialsError):
        await SteamValidator().validate_login(params)


@pytest.mark.asyncio
async def test_validate_login_rejects_when_steam_says_invalid():
    with respx.mock:
        mock_openid_verify(is_valid=False)

        with pytest.raises(SteamInvalidCredentialsError):
            await SteamValidator().validate_login(VALID_OPENID_PARAMS)


@pytest.mark.asyncio
async def test_validate_login_rejects_identity_claimed_id_mismatch():
    params = {
        **VALID_OPENID_PARAMS,
        "openid.claimed_id": f"https://steamcommunity.com/openid/id/{'9' * 17}",
    }

    with respx.mock:
        mock_openid_verify(is_valid=True)

        with pytest.raises(SteamInvalidCredentialsError):
            await SteamValidator().validate_login(params)


@pytest.mark.asyncio
async def test_validate_login_rejects_wrong_identity_prefix():
    forged = "https://evil.example.com/openid/id/" + STEAM_ID
    params = {
        **VALID_OPENID_PARAMS,
        "openid.claimed_id": forged,
        "openid.identity": forged,
    }

    with respx.mock:
        mock_openid_verify(is_valid=True)

        with pytest.raises(SteamPermissionDeniedError):
            await SteamValidator().validate_login(params)


@pytest.mark.asyncio
async def test_validate_login_network_error_becomes_bad_request():
    with respx.mock:
        respx.get(BASEURL).mock(side_effect=httpx.ConnectError("no route to host"))

        with pytest.raises(SteamBadRequestError):
            await SteamValidator().validate_login(VALID_OPENID_PARAMS)


@pytest.mark.asyncio
async def test_validate_login_steam_5xx_becomes_invalid_credentials():
    with respx.mock:
        respx.get(BASEURL).mock(return_value=httpx.Response(500))

        with pytest.raises(SteamInvalidCredentialsError):
            await SteamValidator().validate_login(VALID_OPENID_PARAMS)


# ---------------------------------------------------------------------------
# SteamValidator.fetch_details
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_fetch_details_success():
    with respx.mock:
        mock_player_summary()
        profile = await SteamValidator.fetch_details(STEAM_ID)

    assert profile.steam_id == STEAM_ID
    assert profile.profile_name == "s1mple"
    assert profile.url == "https://steamcommunity.com/id/s1mple/"


@pytest.mark.asyncio
async def test_fetch_details_no_players_returned():
    with respx.mock:
        respx.get(FETCHURL).mock(
            return_value=httpx.Response(200, json={"response": {"players": []}})
        )

        with pytest.raises(SteamDataNotFoundError):
            await SteamValidator.fetch_details(STEAM_ID)


@pytest.mark.asyncio
async def test_fetch_details_steamid_mismatch():
    with respx.mock:
        mock_player_summary(steam_id="1" * 17)

        with pytest.raises(SteamInvalidCredentialsError):
            await SteamValidator.fetch_details(STEAM_ID)


@pytest.mark.asyncio
@pytest.mark.parametrize("missing_field", ["personaname", "profileurl", "avatar"])
async def test_fetch_details_missing_profile_field(missing_field):
    payload = steam_player_payload()
    del payload["response"]["players"][0][missing_field]

    with respx.mock:
        respx.get(FETCHURL).mock(return_value=httpx.Response(200, json=payload))

        with pytest.raises(SteamDataNotFoundError):
            await SteamValidator.fetch_details(STEAM_ID)


@pytest.mark.asyncio
async def test_fetch_details_network_error_becomes_bad_request():
    with respx.mock:
        respx.get(FETCHURL).mock(side_effect=httpx.ConnectError("no route to host"))

        with pytest.raises(SteamBadRequestError):
            await SteamValidator.fetch_details(STEAM_ID)


@pytest.mark.asyncio
async def test_fetch_details_steam_error_status_becomes_not_found():
    with respx.mock:
        respx.get(FETCHURL).mock(return_value=httpx.Response(403))

        with pytest.raises(SteamDataNotFoundError):
            await SteamValidator.fetch_details(STEAM_ID)


# ---------------------------------------------------------------------------
# Router-level: POST /steam and GET /steam/login
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_steam_register_redirects_to_steam(client):
    response = await client.post(
        "/steam", data={"username": "newsteamuser"}, follow_redirects=False
    )

    assert response.status_code == 303
    location = response.headers["location"]
    assert location.startswith("https://steamcommunity.com/openid/login?")
    assert "openid.mode=checkid_setup" in location


@pytest.mark.asyncio
async def test_steam_register_rejects_taken_username(client, helpers):
    await helpers.register_user(client)

    response = await client.post(
        "/steam", data={"username": "authuser"}, follow_redirects=False
    )

    assert response.status_code == 409


@pytest.mark.asyncio
async def test_steam_login_redirects_to_steam(client):
    response = await client.get("/steam/login", follow_redirects=False)

    assert response.status_code == 303
    assert response.headers["location"].startswith(
        "https://steamcommunity.com/openid/login?"
    )


# ---------------------------------------------------------------------------
# Router-level: GET /steam/validate/{username}
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_steam_validate_register_creates_user(client, db):
    with respx.mock:
        mock_openid_verify()
        mock_player_summary()

        response = await client.get(
            "/steam/validate/newsteamuser",
            params=VALID_OPENID_PARAMS,
            follow_redirects=False,
        )

    assert response.status_code == 303
    assert response.cookies.get("access_token")
    assert response.cookies.get("refresh_token")

    user = (
        await db.execute(select(User).where(User.username == "newsteamuser"))
    ).scalar_one()
    steam_login = (
        await db.execute(select(Steam).where(Steam.user_id == user.id))
    ).scalar_one()

    assert steam_login.steam_id == STEAM_ID
    assert steam_login.profile_name == "s1mple"


@pytest.mark.asyncio
async def test_steam_validate_register_rejects_already_linked_steam_id(client):
    with respx.mock:
        mock_openid_verify()
        mock_player_summary()

        first = await client.get(
            "/steam/validate/firstuser",
            params=VALID_OPENID_PARAMS,
            follow_redirects=False,
        )
        assert first.status_code == 303

        mock_openid_verify()
        mock_player_summary()

        second = await client.get(
            "/steam/validate/seconduser",
            params=VALID_OPENID_PARAMS,
            follow_redirects=False,
        )

    assert second.status_code == 409


@pytest.mark.asyncio
async def test_steam_validate_register_rejects_bad_openid_params(client):
    bad_params = {**VALID_OPENID_PARAMS, "openid.sig": ""}

    response = await client.get(
        "/steam/validate/newsteamuser", params=bad_params, follow_redirects=False
    )

    assert response.status_code == 401


# ---------------------------------------------------------------------------
# Router-level: GET /steam/login/validate
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_steam_login_validate_updates_returning_user(client, db):
    with respx.mock:
        mock_openid_verify()
        mock_player_summary(persona_name="original-name")

        registered = await client.get(
            "/steam/validate/returninguser",
            params=VALID_OPENID_PARAMS,
            follow_redirects=False,
        )
    assert registered.status_code == 303
    original_refresh_cookie = registered.cookies.get("refresh_token")

    with respx.mock:
        mock_openid_verify()
        mock_player_summary(persona_name="updated-name")

        response = await client.get(
            "/steam/login/validate",
            params=VALID_OPENID_PARAMS,
            follow_redirects=False,
        )

    assert response.status_code == 303
    assert response.cookies.get("access_token")
    assert response.cookies.get("refresh_token") != original_refresh_cookie

    steam_login = (
        await db.execute(select(Steam).where(Steam.steam_id == STEAM_ID))
    ).scalar_one()
    assert steam_login.profile_name == "updated-name"


@pytest.mark.asyncio
async def test_steam_login_validate_unknown_steam_id_not_found(client):
    with respx.mock:
        mock_openid_verify()
        mock_player_summary()

        response = await client.get(
            "/steam/login/validate",
            params=VALID_OPENID_PARAMS,
            follow_redirects=False,
        )

    assert response.status_code == 404


@pytest.mark.asyncio
async def test_steam_login_validate_propagates_steam_outage(client):
    with respx.mock:
        respx.get(BASEURL).mock(side_effect=httpx.ConnectError("steam is down"))

        response = await client.get(
            "/steam/login/validate",
            params=VALID_OPENID_PARAMS,
            follow_redirects=False,
        )

    assert response.status_code == 400
