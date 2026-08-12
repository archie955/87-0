from httpx import AsyncClient

SQLALCHEMY_DATABASE_URL = (
    "postgresql+psycopg://postgres:postgres@localhost:5433/test_db"
)


class Helpers:
    @staticmethod
    async def register_user(client: AsyncClient) -> dict[str, str]:
        user = {
            "email": "authuser@example.com",
            "username": "authusername",
            "password": "authpassword",
        }
        response = await client.post(url="/users", json=user)

        assert response.status_code == 201
        data = response.json()
        assert "created_at" in data
        assert "updated_at" in data
        return user

    @staticmethod
    async def full_login(client: AsyncClient) -> dict[str, str]:
        user = {
            "email": "authuser@example.com",
            "username": "authusername",
            "password": "authpassword",
        }
        user_payload = await client.post(url="/users", json=user)

        assert user_payload.status_code == 201

        response = await client.post(
            url="/users/login",
            data={"username": user["email"], "password": user["password"]},
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )

        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        user["access_token"] = data["access_token"]
        return user

    @staticmethod
    def auth_headers(user: dict[str, str], expired: bool = False) -> dict[str, str]:
        token = user["access_token"]
        if expired:
            token = "expired_token"
        return {"Authorization": f"Bearer {token}"}

    @staticmethod
    async def update_user(
        client: AsyncClient, updated: dict[str, str], user: dict[str, str]
    ) -> dict[str, str]:
        response = await client.put(
            url="/users",
            json=updated,
            headers={"Authorization": f"Bearer {user['access_token']}"},
        )

        assert response.status_code == 200
        data = response.json()

        assert data["username"] == updated["updated_user"]["username"]  # ty:ignore[invalid-argument-type]
        assert data["email"] == updated["updated_user"]["email"]  # ty:ignore[invalid-argument-type]

        return data
