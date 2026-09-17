from tests.helpers import register_user

# ---------------------------------------------------------------------------
# Router-level: POST /email
# ---------------------------------------------------------------------------


async def test_registration(client):
    user = await register_user(client)

    assert user.email == "authuser@example.com"
    assert user.username == "authuser"


async def test_duplicate_email_registration(client):
    user = await register_user(client)

    response = await client.post(
        "/email",
        json={
            "username": "newusername",
            "email": user.email,
            "password": "newpassword",
        },
    )

    assert response.status_code == 409


async def test_duplicate_username_registration(client):
    user = await register_user(client)

    response = await client.post(
        "/email",
        json={
            "username": user.username,
            "email": "newemail@email.com",
            "password": "newpassword",
        },
    )

    assert response.status_code == 409


async def test_duplicate_password_ok(client):
    user = await register_user(client)

    response = await client.post(
        "/email",
        json={
            "username": "new_username",
            "email": "newemail@email.com",
            "password": user.password,
        },
    )

    assert response.status_code == 201


async def test_missing_email_registration(client):
    user = {"username": "authuser", "password": "missingdata"}

    response = await client.post("/email", json=user)

    assert response.status_code == 422


async def test_missing_username_registration(client):
    user = {"email": "authuser@email.com", "password": "missingdata"}

    response = await client.post("/email", json=user)

    assert response.status_code == 422


async def test_missing_password_registration(client):
    user = {"username": "authuser", "email": "missingdata@example.com"}

    response = await client.post("/email", json=user)

    assert response.status_code == 422


async def test_incorrect_email_type(client):
    user = {
        "username": "authuser",
        "email": "incorrectgmail.com",
        "password": "password",
    }

    response = await client.post("/email", json=user)

    assert response.status_code == 422


# ---------------------------------------------------------------------------
# Router-level: POST /email/login
# ---------------------------------------------------------------------------


async def test_login_email(client):
    user = await register_user(client)

    response = await client.post(
        "/email/login",
        data={
            "username": user.email,
            "password": user.password,
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )

    assert response.status_code == 200
    assert "access_token" in response.cookies
    assert "refresh_token" in response.cookies


async def test_incorrect_password(client):
    user = await register_user(client)

    response = await client.post(
        "/email/login",
        data={"username": user.email, "password": "incorrectpassword"},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )

    assert response.status_code == 401
    assert "access_token" not in response.cookies
    assert "refresh_token" not in response.cookies


async def test_incorrect_email(client):
    user = await register_user(client)

    response = await client.post(
        "/email/login",
        data={"username": "incorrectEmail@email.com", "password": user.password},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )

    assert response.status_code == 401
    assert "access_token" not in response.cookies
    assert "refresh_token" not in response.cookies


async def test_login_lockout(client):
    user = await register_user(client)

    for _ in range(3):
        response = await client.post(
            "/email/login",
            data={"username": user.email, "password": "incorrectpassword"},
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        assert response.status_code == 401

    response = await client.post(
        "/email/login",
        data={"username": user.email, "password": "incorrectpassword"},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )

    assert response.status_code == 403


# ---------------------------------------------------------------------------
# Router-level: PUT /users
# ---------------------------------------------------------------------------


async def test_update_username(auth_client):
    response = await auth_client.put(
        "/users",
        json={
            "updated_username": "newusername",
            "password": auth_client.user.password,
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["email_login"]["email"] == auth_client.user.email
    assert data["username"] == "newusername"


async def test_update_same_username(auth_client):
    updated_payload = {
        "updated_username": auth_client.user.username,
        "password": auth_client.user.password,
    }

    response = await auth_client.put(
        "/users",
        json=updated_payload,
    )

    assert response.status_code == 409


# ---------------------------------------------------------------------------
# Router-level: DELETE /users
# ---------------------------------------------------------------------------


async def test_delete(auth_client):
    response = await auth_client.delete("/users")

    assert response.status_code == 204


async def test_delete_not_logged_in(auth_client):
    response = await auth_client.noauth_delete("/users")

    assert response.status_code == 401
