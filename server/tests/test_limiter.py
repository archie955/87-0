import httpx

from tests.helpers import register_user


async def test_limiter(client, rate_limiting_on):
    # override ASGITransport client IP so it is steady
    app = client._transport.app
    app.state.limiter = rate_limiting_on
    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app, client=("192.168.1.99", 1234)),
        base_url="http://test",
    ) as ac:
        user = await register_user(ac)
        payload = {"username": user.email, "password": user.password}
        headers = {"Content-Type": "application/x-www-form-urlencoded"}

        for _ in range(10):
            response = await ac.post(
                "/email/login",
                data=payload,
                headers=headers,
            )
            assert response.status_code == 200

        response = await ac.post(
            "/email/login",
            data=payload,
            headers=headers,
        )

        assert response.status_code == 429
