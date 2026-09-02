import pytest


@pytest.mark.asyncio
async def test_registration(client, helpers):
    response = await helpers.register_user(client)

    assert response["email"] == "authuser@example.com"
    assert response["username"] == "authuser"


@pytest.mark.asyncio
async def test_duplicate_email_registration(client, helpers):
    user = await helpers.register_user(client)

    user["username"] = "newusername"

    response = await client.post("/email", json=user)

    assert response.status_code == 409


@pytest.mark.asyncio
async def test_duplicate_username_registration(client, helpers):
    user = await helpers.register_user(client)

    user["email"] = "newemail@email.com"

    response = await client.post("/email", json=user)

    assert response.status_code == 409


@pytest.mark.asyncio
async def test_duplicate_password_ok(client, helpers):
    user = await helpers.register_user(client)

    user["email"] = "newusername@example.com"
    user["username"] = "newuser"

    response = await client.post("/email", json=user)

    assert response.status_code == 201


@pytest.mark.asyncio
async def test_missing_email_registration(client):
    user = {"username": "authuser", "password": "missingdata"}

    response = await client.post("/email", json=user)

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_missing_username_registration(client):
    user = {"email": "authuser@email.com", "password": "missingdata"}

    response = await client.post("/email", json=user)

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_missing_password_registration(client):
    user = {"username": "authuser", "email": "missingdata@example.com"}

    response = await client.post("/email", json=user)

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_incorrect_email_type(client):
    user = {
        "username": "authuser",
        "email": "incorrectgmail.com",
        "password": "password",
    }

    response = await client.post("/email", json=user)

    assert response.status_code == 422


# Login endpoint testing


@pytest.mark.asyncio
async def test_login_email(client, helpers):
    user = await helpers.register_user(client)

    response = await client.post(
        "/email/login",
        data={"username": user["email"], "password": user["password"]},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )

    assert response.status_code == 200

    assert "access_token" in response.cookies
    assert "refresh_token" in response.cookies


@pytest.mark.asyncio
async def test_incorrect_password(client, helpers):
    user = await helpers.register_user(client)

    response = await client.post(
        "/email/login",
        data={"username": user["email"], "password": "incorrectpassword"},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )

    assert response.status_code == 401


@pytest.mark.asyncio
async def test_incorrect_email(client, helpers):
    user = await helpers.register_user(client)

    response = await client.post(
        "/email/login",
        data={"username": "notroot", "password": user["password"]},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )

    assert response.status_code == 401


# test update endpoint


@pytest.mark.asyncio
async def test_update_username(client, helpers):
    user = await helpers.full_login(client)

    updated_payload = {
        "updated_username": "newusername",
        "password": user["password"],
    }

    response = await helpers.update_user(client, updated_payload, user)

    assert response["email_login"]["email"] == user["email"]
    assert response["username"] == updated_payload["updated_username"]


@pytest.mark.asyncio
async def test_update_same_username(client, helpers):
    user = await helpers.full_login(client)

    updated_payload = {
        "updated_username": user["username"],
        "password": user["password"],
    }

    response = await client.put(
        "/users",
        json=updated_payload,
        headers=helpers.auth_headers(user, expired=False),
    )

    assert response.status_code == 409


@pytest.mark.asyncio
async def test_update_incorrect_password(client, helpers):
    user = await helpers.full_login(client)

    updated_payload = {
        "updated_username": "newusername",
        "password": "incorrect",
    }
    response = await client.put(
        "/users",
        json=updated_payload,
        headers=helpers.auth_headers(user, expired=False),
    )

    assert response.status_code == 401


# test delete endpoint


@pytest.mark.asyncio
async def test_delete(client, helpers):
    user = await helpers.full_login(client)

    response = await client.delete(
        "/users", cookies=helpers.auth_headers(user, expired=False)
    )

    assert response.status_code == 204


@pytest.mark.asyncio
async def test_delete_not_logged_in(client, helpers):
    await helpers.register_user(client)

    client.cookies.clear()

    response = await client.delete("/users")

    assert response.status_code == 401
