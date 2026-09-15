from typing import Any

from httpx import AsyncClient, Cookies, Response

from tests.helpers import TestUser


class AuthClient:
    def __init__(
        self,
        client: AsyncClient,
        user: TestUser,
    ) -> None:
        self.client = client
        self.user = user

    def auth_cookies(self, expired: bool = False) -> Cookies:
        access_token = self.user.access_token

        if expired:
            access_token = "expired_token"

        return Cookies(
            {
                "access_token": access_token,
                "refresh_token": self.user.refresh_token,
            }
        )

    async def request(
        self,
        method: str,
        url: str,
        **kwargs: Any,
    ) -> Response:
        return await self.client.request(
            method,
            url,
            cookies=self.auth_cookies(),
            **kwargs,
        )

    async def get(self, url: str, **kwargs: Any) -> Response:
        return await self.request("GET", url, **kwargs)

    async def post(self, url: str, **kwargs: Any) -> Response:
        return await self.request("POST", url, **kwargs)

    async def put(self, url: str, **kwargs: Any) -> Response:
        return await self.request("PUT", url, **kwargs)

    async def delete(self, url: str, **kwargs: Any) -> Response:
        return await self.request("DELETE", url, **kwargs)

    async def noauth_get(self, url: str, **kwargs: Any) -> Response:
        self.client.cookies.clear()
        return await self.client.get(url, **kwargs)

    async def noauth_post(self, url: str, **kwargs: Any) -> Response:
        self.client.cookies.clear()
        return await self.client.post(url, **kwargs)

    async def noauth_put(self, url: str, **kwargs: Any) -> Response:
        self.client.cookies.clear()
        return await self.client.put(url, **kwargs)

    async def noauth_delete(self, url: str, **kwargs: Any) -> Response:
        self.client.cookies.clear()
        return await self.client.delete(url, **kwargs)
