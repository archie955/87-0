from urllib.parse import urlencode

import requests
from fastapi import status
from fastapi.responses import RedirectResponse


class SteamLogin:
    def __init__(self, home_url: str):
        self.__baseurl = "https://steamcommunity.com/openid/login"
        self.__params = {
            "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
            "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
            "openid.mode": "checkid_setup",
            "openid.ns": "http://specs.openid.net/auth/2.0",
            "openid.realm": home_url,
            "openid.return_to": home_url,
        }

    def __createUrl(self) -> str:
        return f"{self.__baseurl}?{urlencode(self.__params)}"

    # This redirects to steam.
    # Upon login it will send a request to the return_to url provided.
    def Redirect(self) -> RedirectResponse:
        url = self.__createUrl()
        response = RedirectResponse(
            url=url,
            status_code=status.HTTP_303_SEE_OTHER,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        return response


class SteamValidator:
    def __init__(self):
        self.__baseurl = "https://steamcommunity.com/openid/login"
        self.__validationParams = {}

    def ValidateLogin(self, data) -> str | bool:
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
            self.__validationParams[param] = val

        self.__validationParams["openid.mode"] = "check_authentication"

        response = requests.get(self.__baseurl, params=self.__validationParams).text

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

        return identity[p:]