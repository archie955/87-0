from datetime import UTC, datetime, timedelta
from urllib.parse import urlencode

from fastapi import status
from fastapi.responses import RedirectResponse
from httpx import AsyncClient, HTTPStatusError, RequestError

from exceptions.steam_exceptions import (
    SteamBadRequestError,
    SteamDataNotFoundError,
    SteamInvalidCredentialsError,
    SteamPermissionDeniedError,
)
from schemas.steam_schemas import SteamProfile

"""example output of fetch here:
{"response":
    {"players":
        [
            {"steamid":"76561197960435530",
            "communityvisibilitystate":3,
            "profilestate":1,
            "personaname":"Robin",
            "profileurl":"https://steamcommunity.com/id/robinwalker/",
            "avatar":"https://avatars.steamstatic.com/81b5478529dce13bf24b55ac42c1af7058aaf7a9.jpg",
            "avatarmedium":"https://avatars.steamstatic.com/81b5478529dce13bf24b55ac42c1af7058aaf7a9_medium.jpg",
            "avatarfull":"https://avatars.steamstatic.com/81b5478529dce13bf24b55ac42c1af7058aaf7a9_full.jpg",
            "avatarhash":"81b5478529dce13bf24b55ac42c1af7058aaf7a9",
            "personastate":0,
            "realname":"Robin Walker",
            "primaryclanid":"103582791429521412",
            "timecreated":1063407589,
            "personastateflags":0,
            "loccountrycode":"US",
            "locstatecode":"WA",
            "loccityid":3961
            }
        ]
    }
}
"""

BASEURL = "https://steamcommunity.com/openid/login"
FETCHURL = "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/"


class SteamLogin:
    def __init__(self, return_url: str, state: str):
        return_url_with_state = f"{return_url}?state={state}"
        self.__params = {
            "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
            "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
            "openid.mode": "checkid_setup",
            "openid.ns": "http://specs.openid.net/auth/2.0",
            "openid.realm": return_url,
            "openid.return_to": return_url_with_state,
            "state": state,
        }
        self.state = state

    def __create_url(self) -> str:
        return f"{BASEURL}?{urlencode(self.__params)}"

    # This redirects to steam.
    # Upon login it will send a request to the return_to url provided.
    def redirect(self) -> RedirectResponse:
        response = RedirectResponse(
            url=self.__create_url(),
            status_code=status.HTTP_303_SEE_OTHER,
        )
        time = datetime.now(tz=UTC) + timedelta(minutes=10)
        response.set_cookie(key="state", value=self.state, secure=True, expires=time)
        return response


class SteamValidator:
    __IDENTITY_PREFIX = "https://steamcommunity.com/openid/id/"

    __OPENID_PARAMETERS = (
        "openid.ns",
        "openid.mode",
        "openid.op_endpoint",
        "openid.claimed_id",
        "openid.identity",
        "openid.return_to",
        "openid.response_nonce",
        "openid.assoc_handle",
        "openid.signed",
        "openid.sig",
    )

    async def validate_login(self, data: dict[str, str], session_state: str) -> str:  # ruff: ignore[complex-structure]
        state = data.get("state")
        if not state or state != session_state:
            raise SteamInvalidCredentialsError()

        validation_params: dict[str, str] = {}
        for param in self.__OPENID_PARAMETERS:
            value = data.get(param)

            if not value or not isinstance(value, str):
                raise SteamInvalidCredentialsError()

            validation_params[param] = value

        validation_params["openid.mode"] = "check_authentication"

        async with AsyncClient() as client:
            try:
                response = await client.get(
                    BASEURL, params=validation_params, timeout=10
                )
                response.raise_for_status()
            except RequestError as exc:
                raise SteamBadRequestError(
                    message=f"Error whilst requesting {exc.request.url}"
                ) from exc
            except HTTPStatusError as exc:
                raise SteamInvalidCredentialsError() from exc

        validation_result = {}

        for line in response.text.splitlines():
            if ":" in line:
                key, value = line.split(":", 1)
                validation_result[key.strip()] = value.strip()

        if validation_result.get("is_valid") != "true":
            raise SteamInvalidCredentialsError()

        identity = data.get("openid.identity")
        claimed_id = data.get("openid.claimed_id")

        if identity != claimed_id:
            raise SteamInvalidCredentialsError()

        if not isinstance(identity, str):
            raise SteamInvalidCredentialsError()

        if not identity.startswith(self.__IDENTITY_PREFIX):
            raise SteamPermissionDeniedError()

        steam_id = identity.removeprefix(self.__IDENTITY_PREFIX)

        if not steam_id:
            raise SteamInvalidCredentialsError()

        return steam_id

    @staticmethod
    async def fetch_details(steam_id: str, key: str) -> SteamProfile:
        params = {"key": key, "steamids": steam_id}

        async with AsyncClient() as client:
            try:
                response = await client.get(
                    FETCHURL,
                    params=params,
                    timeout=10,
                )
                response.raise_for_status()
            except RequestError as exc:
                raise SteamBadRequestError(
                    message=f"Error while requesting {exc.request.url}"
                ) from exc
            except HTTPStatusError as exc:
                raise SteamDataNotFoundError(datatype="Steam user") from exc

        data = response.json()

        players = data.get("response", {}).get("players", [])

        if not players:
            raise SteamDataNotFoundError(datatype="user")

        player = players[0]

        if player.get("steamid") != steam_id:
            raise SteamInvalidCredentialsError()

        profile_name = player.get("personaname")
        profile_url = player.get("profileurl")
        avatar = player.get("avatar")

        if not profile_name:
            raise SteamDataNotFoundError(datatype="username")

        if not profile_url:
            raise SteamDataNotFoundError(datatype="profile")

        if not avatar:
            raise SteamDataNotFoundError(datatype="avatar")

        return SteamProfile(
            steam_id=steam_id,
            profile_name=profile_name,
            url=profile_url,
            avatar=avatar,
        )
