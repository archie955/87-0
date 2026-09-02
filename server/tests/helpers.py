from typing import Any

from httpx import AsyncClient, Cookies

SQLALCHEMY_DATABASE_URL = (
    "postgresql+psycopg://postgres:postgres@localhost:5433/test_db"
)


class Helpers:
    @staticmethod
    async def register_user(client: AsyncClient) -> dict[str, str]:
        user = {
            "username": "authuser",
            "email": "authuser@example.com",
            "password": "authpassword",
        }
        response = await client.post(url="/email", json=user)

        assert response.status_code == 201

        access_token, refresh_token = (
            response.cookies.get("access_token"),
            response.cookies.get("refresh_token"),
        )

        assert access_token
        assert refresh_token

        cookies = Cookies(
            {"access_token": access_token, "refresh_token": refresh_token}
        )

        response = await client.get(url="/users", cookies=cookies)
        data = response.json()

        assert data["username"] == user["username"]
        assert data["email_login"]["email"] == user["email"]
        assert "id" in data
        assert "created_at" in data
        assert "updated_at" in data
        return user

    @staticmethod
    async def full_login(client: AsyncClient) -> dict[str, str]:
        user = {
            "username": "authuser",
            "email": "authuser@example.com",
            "password": "authpassword",
        }
        response = await client.post(url="/email", json=user)

        assert response.status_code == 201

        access_token, refresh_token = (
            response.cookies.get("access_token"),
            response.cookies.get("refresh_token"),
        )

        assert access_token
        assert refresh_token

        cookies = Cookies(
            {"access_token": access_token, "refresh_token": refresh_token}
        )

        user["access_token"] = access_token
        user["refresh_token"] = refresh_token

        response = await client.get(url="/users", cookies=cookies)
        data = response.json()

        assert data["username"] == user["username"]
        assert data["email_login"]["email"] == user["email"]
        assert "id" in data
        assert "created_at" in data
        assert "updated_at" in data

        return user

    @staticmethod
    def auth_headers(user: dict[str, str], expired: bool) -> Cookies:
        access_token = user["access_token"]
        refresh_token = user["refresh_token"]
        if expired:
            # ruff: ignore[hardcoded-password-string]
            access_token = "expired_token"
        return Cookies({"access_token": access_token, "refresh_token": refresh_token})

    @staticmethod
    async def update_user(
        client: AsyncClient, updated: dict[str, str], user: dict[str, Any]
    ) -> dict[str, str]:
        cookies = Cookies(
            {
                "access_token": user["access_token"],
                "refresh_token": user["refresh_token"],
            }
        )
        response = await client.put(
            url="/users",
            json=updated,
            cookies=cookies,
        )

        assert response.status_code == 200

        return response.json()
