from urllib.parse import urlencode

from fastapi import status
from fastapi.responses import RedirectResponse
from httpx import AsyncClient

from exceptions.app_exceptions import (
    DataNotFoundError,
    InvalidCredentialsError,
    PermissionDeniedError,
)
from schemas.steam_schemas import Profile
from utils.config import get_settings

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

settings = get_settings()
KEY = settings.steam_key
BASEURL = "https://steamcommunity.com/openid/login"
FETCHURL = "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/"


class SteamLogin:
    def __init__(self, home_url: str):
        self.__params = {
            "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
            "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
            "openid.mode": "checkid_setup",
            "openid.ns": "http://specs.openid.net/auth/2.0",
            "openid.realm": home_url,
            "openid.return_to": home_url,
        }

    def __create_url(self) -> str:
        return f"{BASEURL}?{urlencode(self.__params)}"

    # This redirects to steam.
    # Upon login it will send a request to the return_to url provided.
    def redirect(self) -> RedirectResponse:
        url = self.__create_url()
        return RedirectResponse(
            url=url,
            status_code=status.HTTP_303_SEE_OTHER,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )


class SteamValidator:
    def __init__(self):
        self.__validation_params = {}
        self.__identity = None

    async def validate_login(self, data) -> str | bool:
        string_params = (
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

        for param in string_params:
            val = data.get(param)
            if not val or not isinstance(val, str):
                return False
            self.__validation_params[param] = val

        self.__validation_params["openid.mode"] = "check_authentication"

        async with AsyncClient() as client:
            response = (
                await client.get(BASEURL, params=self.__validation_params, timeout=10)
            ).text

        validator = {}

        for line in response.splitlines():
            if ":" in line:
                k, v = line.split(":", 1)
                validator[k.strip()] = v.strip()

        if validator["is_valid"] != "true":
            return False

        identity = data.get("openid.identity")
        if identity != data.get("openid.claimed_id"):
            return False

        prefix = "https://steamcommunity.com/openid/id/"
        p = len(prefix)
        if identity[:p] != prefix:
            return False

        self.__identity = identity[p:]

        return identity[p:]

    async def fetch_details(self) -> Profile:
        params = {"key": KEY, "steamids": self.__identity}

        async with AsyncClient() as client:
            response = (await client.get(FETCHURL, params=params, timeout=10)).json()

        if not response.players or not response.players[0]:
            raise DataNotFoundError(datatype="user")

        player = response.players[0]

        if not player.steamid or player.steamid != self.__identity:
            raise InvalidCredentialsError()

        if not player.personaname:
            raise DataNotFoundError(datatype="username")

        if not player.profileurl:
            raise DataNotFoundError(datatype="profile")

        if not player.avatar:
            raise DataNotFoundError(datatype="avatar")

        if not isinstance(self.__identity, str):
            raise PermissionDeniedError()

        return Profile(
            username=player.personaname,
            url=player.profileurl,
            avatar=player.avatar,
            steam_id=self.__identity,
        )
