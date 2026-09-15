async def test_fetch_teams(auth_client_seed):
    response = await auth_client_seed.get("/teams")

    assert response.status_code == 200

    data = response.json()
    teams = list(data.values())

    assert len(teams) == 3

    team_names = {team["name"] for team in teams}

    assert team_names == {
        "Vitality",
        "Falcons",
        "Spirit",
    }

    falcons = next(team for team in teams if team["name"] == "Falcons")

    player_names = {player["name"] for player in falcons["players"]}

    assert player_names == {
        "NiKo",
        "kyousuke",
        "TeSeS",
        "m0nesy",
        "karrigan",
    }


async def test_fetch_no_teams(auth_client):
    response = await auth_client.get("/teams")

    assert response.status_code == 404


async def test_fetch_teams_no_auth(auth_client_seed):
    response = await auth_client_seed.noauth_get("/teams")

    assert response.status_code == 200

    data = response.json()
    teams = list(data.values())

    assert len(teams) == 3

    team_names = {team["name"] for team in teams}

    assert team_names == {
        "Vitality",
        "Falcons",
        "Spirit",
    }

    falcons = next(team for team in teams if team["name"] == "Falcons")

    player_names = {player["name"] for player in falcons["players"]}

    assert player_names == {
        "NiKo",
        "kyousuke",
        "TeSeS",
        "m0nesy",
        "karrigan",
    }


async def test_fetch_teams_no_user(client, auth_client_seed):
    health = await auth_client_seed.get("/health")

    assert health.status_code == 200

    response = await client.get("/teams")

    assert response.status_code == 200

    data = response.json()
    teams = list(data.values())

    assert len(teams) == 3

    team_names = {team["name"] for team in teams}

    assert team_names == {
        "Vitality",
        "Falcons",
        "Spirit",
    }

    falcons = next(team for team in teams if team["name"] == "Falcons")

    player_names = {player["name"] for player in falcons["players"]}

    assert player_names == {
        "NiKo",
        "kyousuke",
        "TeSeS",
        "m0nesy",
        "karrigan",
    }
