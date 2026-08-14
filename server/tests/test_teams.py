import pytest


@pytest.mark.asyncio
async def test_fetch_teams(auth_client_seed):
    response = await auth_client_seed.get("/teams")

    assert response.status_code == 200
    data = response.json()

    keys = data.keys()
    teams = [data[key] for key in keys]

    assert len(teams) == 2
    names = {teams[0]["name"], teams[1]["name"]}

    assert "Vitality" in names
    assert "Falcons" in names

    team = teams[0] if teams[0]["name"] == "Falcons" else teams[1]
    player_names = {"NiKo", "kyousuke", "TeSeS", "m0nesy", "karrigan"}

    assert "players" in team
    players = team["players"]

    for p in players:
        assert p["name"] in player_names


async def test_fetch_no_teams(auth_client):
    response = await auth_client.get("/teams")

    assert response.status_code == 404


async def test_fetch_teams_no_auth(auth_client_seed):
    response = await auth_client_seed.noauth_get("/teams")

    assert response.status_code == 200
    data = response.json()

    keys = data.keys()
    teams = [data[key] for key in keys]

    assert len(teams) == 2
    names = {teams[0]["name"], teams[1]["name"]}

    assert "Vitality" in names
    assert "Falcons" in names

    team = teams[0] if teams[0]["name"] == "Falcons" else teams[1]
    player_names = {"NiKo", "kyousuke", "TeSeS", "m0nesy", "karrigan"}

    assert "players" in team
    players = team["players"]

    for p in players:
        assert p["name"] in player_names


async def test_fetch_teams_no_user(client, auth_client_seed):
    health = await auth_client_seed.get("/health")

    assert health.status_code == 200
    response = await client.get("/teams")

    assert response.status_code == 200
    data = response.json()

    keys = data.keys()
    teams = [data[key] for key in keys]

    assert len(teams) == 2
    names = {teams[0]["name"], teams[1]["name"]}

    assert "Vitality" in names
    assert "Falcons" in names

    team = teams[0] if teams[0]["name"] == "Falcons" else teams[1]
    player_names = {"NiKo", "kyousuke", "TeSeS", "m0nesy", "karrigan"}

    assert "players" in team
    players = team["players"]

    for p in players:
        assert p["name"] in player_names
