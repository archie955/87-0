from typing import Any

from httpx import AsyncClient, Response
from sqlalchemy.ext.asyncio import AsyncSession

SQLALCHEMY_DATABASE_URL = (
    "postgresql+psycopg://postgres:postgres@localhost:5433/test_db"
)


class AuthClient:
    def __init__(
        self, client: AsyncClient, user: dict[str, str], db: AsyncSession
    ) -> None:
        self.client = client
        self.db = db
        self.user = user

    def auth_headers(self, expired: bool = False) -> dict[str, str]:
        token = self.user["access_token"]
        if expired:
            token = "expired_token"
        return {"Authorization": f"Bearer {token}"}

    async def request(self, method: str, url: str, **kwargs: Any) -> Response:
        headers: dict[str, str] = kwargs.pop("headers", {})
        headers.update(self.auth_headers())
        response = await self.client.request(method, url, headers=headers, **kwargs)
        return response

    async def get(self, url: str, **kwargs: Any) -> Response:
        response = await self.request(method="GET", url=url, **kwargs)
        return response

    async def post(self, url: str, **kwargs: Any) -> Response:
        response = await self.request(method="POST", url=url, **kwargs)
        return response

    async def put(self, url: str, **kwargs: Any) -> Response:
        response = await self.request(method="PUT", url=url, **kwargs)
        return response

    async def delete(self, url: str, **kwargs: Any) -> Response:
        response = await self.request(method="DELETE", url=url, **kwargs)
        return response

    async def noauth_get(self, url: str, **kwargs: Any) -> Response:
        response = await self.client.get(url=url, **kwargs)
        return response

    async def noauth_post(self, url: str, **kwargs: Any) -> Response:
        response = await self.client.post(url=url, **kwargs)
        return response

    async def noauth_put(self, url: str, **kwargs: Any) -> Response:
        response = await self.client.put(url=url, **kwargs)
        return response

    async def noauth_delete(self, url: str, **kwargs: Any) -> Response:
        response = await self.client.delete(url=url, **kwargs)
        return response
