import pytest


@pytest.mark.asyncio
async def test_fetch_teams(auth_client_seed):
    response = await auth_client_seed.get("/teams")

    assert response.status_code == 200
    data = response.json()

    assert "teams" in data

    teams = data["teams"]

    assert len(teams) == 2
    names = {teams[0]["name"], teams[1]["name"]}

    assert "Vitality" in names
    assert "Falcons" in names

    team = teams[0] if teams[0]["name"] == "Falcons" else teams[1]
    player_names = {"NiKo", "kyousuke", "TeSeS", "m0nesy", "karrigan"}

    assert "players" in team
    assert "players" in team["players"]

    players = team["players"]["players"]
    for p in players:
        assert p["name"] in player_names
