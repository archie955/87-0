from dataclasses import dataclass

from httpx import AsyncClient, Cookies


@dataclass(frozen=True)
class TestUser:
    username: str
    email: str
    password: str
    access_token: str
    refresh_token: str

    @property
    def cookies(self) -> Cookies:
        return Cookies(
            {
                "access_token": self.access_token,
                "refresh_token": self.refresh_token,
            }
        )


async def register_user(
    client: AsyncClient,
    username: str = "authuser",
    email: str = "authuser@example.com",
    password: str = "authpassword",
) -> TestUser:
    user = {
        "username": username,
        "email": email,
        "password": password,
    }

    response = await client.post("/email", json=user)

    assert response.status_code == 201

    access_token = response.cookies.get("access_token")
    refresh_token = response.cookies.get("refresh_token")

    assert access_token is not None
    assert refresh_token is not None

    return TestUser(
        username=username,
        email=email,
        password=password,
        access_token=access_token,
        refresh_token=refresh_token,
    )


async def get_user(
    client: AsyncClient,
    user: TestUser,
) -> dict:
    response = await client.get(
        "/users",
        cookies=user.cookies,
    )

    assert response.status_code == 200

    return response.json()


async def update_user(
    client: AsyncClient,
    user: TestUser,
    updated: dict[str, str],
) -> dict:
    response = await client.put(
        "/users",
        json=updated,
        cookies=user.cookies,
    )

    assert response.status_code == 200

    return response.json()
