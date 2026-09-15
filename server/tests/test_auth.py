from datetime import UTC, datetime, timedelta

from httpx import Cookies
from sqlalchemy import select

from models.models import RefreshToken
from tests.helpers import register_user


async def test_refresh_issues_new_tokens_and_rotates_the_old_one(client, db):
    user = await register_user(client)
    old_refresh_cookie = user.refresh_token

    old_row = (await db.execute(select(RefreshToken))).scalar_one()

    response = await client.post(
        "/auth/refresh",
        cookies=Cookies({"refresh_token": old_refresh_cookie}),
    )

    assert response.status_code == 200

    new_access = response.cookies.get("access_token")
    new_refresh = response.cookies.get("refresh_token")

    assert new_access
    assert new_refresh
    assert new_refresh != old_refresh_cookie

    rows = (await db.execute(select(RefreshToken))).scalars().all()

    assert len(rows) == 1
    assert rows[0].jti != old_row.jti


async def test_refresh_without_a_cookie_is_unauthorized(client):
    response = await client.post("/auth/refresh")

    assert response.status_code == 401


async def test_refresh_rejects_a_replayed_already_rotated_token(client):
    user = await register_user(client)
    first_refresh_cookie = user.refresh_token

    rotated = await client.post(
        "/auth/refresh",
        cookies=Cookies({"refresh_token": first_refresh_cookie}),
    )

    assert rotated.status_code == 200

    replayed = await client.post(
        "/auth/refresh",
        cookies=Cookies({"refresh_token": first_refresh_cookie}),
    )

    assert replayed.status_code == 401


async def test_refresh_rejects_an_expired_refresh_token(client, db):
    user = await register_user(client)

    row = (await db.execute(select(RefreshToken))).scalar_one()
    row.expires_at = datetime.now(tz=UTC) - timedelta(days=1)
    await db.commit()

    response = await client.post(
        "/auth/refresh",
        cookies=Cookies({"refresh_token": user.refresh_token}),
    )

    assert response.status_code == 401


async def test_logout_revokes_the_session_server_side(client, db):
    user = await register_user(client)

    response = await client.post(
        "/auth/logout",
        cookies=Cookies({"refresh_token": user.refresh_token}),
    )

    assert response.status_code == 200

    rows = (await db.execute(select(RefreshToken))).scalars().all()
    assert rows == [], f"Expected no refresh tokens, but found {len(rows)}"

    replay = await client.post(
        "/auth/refresh",
        cookies=Cookies({"refresh_token": user.refresh_token}),
    )

    assert replay.status_code == 401


async def test_logout_clears_both_cookies(client):
    user = await register_user(client)

    response = await client.post(
        "/auth/logout",
        cookies=Cookies({"refresh_token": user.refresh_token}),
    )

    set_cookie_headers = response.headers.get_list("set-cookie")

    assert any(
        header.startswith("access_token=") and "Max-Age=0" in header
        for header in set_cookie_headers
    )
    assert any(
        header.startswith("refresh_token=") and "Max-Age=0" in header
        for header in set_cookie_headers
    )


async def test_logout_with_no_cookie_is_a_harmless_no_op(client):
    response = await client.post("/auth/logout")

    assert response.status_code == 200


async def test_logout_with_a_garbage_cookie_is_a_harmless_no_op(client):
    response = await client.post(
        "/auth/logout",
        cookies=Cookies({"refresh_token": "not-a-real-token"}),
    )

    assert response.status_code == 200
