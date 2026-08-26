import pytest

from tests.game_helpers import play_game, play_game_switch_team, play_game_wrong_igl


@pytest.mark.asyncio
async def test_create_game(auth_client_seed):
    response = await auth_client_seed.post("/games")

    assert response.status_code == 201

    data = response.json()

    assert "id" in data
    assert "team_1_id" in data
    assert "team_2_id" in data
    assert "team_3_id" in data
    assert "team_4_id" in data
    assert "team_5_id" in data
    assert "team_6_id" in data


@pytest.mark.asyncio
async def test_create_game_no_teams(auth_client):
    response = await auth_client.post("/games")

    assert response.status_code == 404


@pytest.mark.asyncio
async def test_play_game_user(auth_client_seed):
    jsn = await play_game(auth_client_seed)
    response = await auth_client_seed.post(f"/games/{jsn['game_id']}/user", json=jsn)

    assert response.status_code == 200
    data = response.json()
    assert "score" in data
    assert "best" in data

    assert isinstance(data["score"], float)
    assert data["best"]


@pytest.mark.asyncio
async def test_play_game(auth_client_seed):
    jsn = await play_game(auth_client_seed)

    response = await auth_client_seed.noauth_post(f"/games/{jsn['game_id']}", json=jsn)

    assert response.status_code == 200
    data = response.json()
    assert "score" in data

    assert isinstance(data["score"], float)


@pytest.mark.asyncio
async def test_play_game_user_no_auth(auth_client_seed):
    jsn = await play_game(auth_client_seed)

    response = await auth_client_seed.noauth_post(
        f"/games/{jsn['game_id']}/user", json=jsn
    )

    assert response.status_code == 401


@pytest.mark.asyncio
async def test_play_game_wrong_team_id(auth_client_seed):
    jsn = await play_game_switch_team(auth_client_seed)

    response = await auth_client_seed.post(f"/games/{jsn['game_id']}/user", json=jsn)

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_play_game_wrong_number_of_players(auth_client_seed):
    jsn = await play_game(auth_client_seed)

    del jsn["player_5"]

    response = await auth_client_seed.post(f"/games/{jsn['game_id']}/user", json=jsn)

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_play_game_fake_player(auth_client_seed):
    jsn = await play_game(auth_client_seed)

    player_1 = jsn["player_1"]
    player_1["id"] = 100

    jsn["player_1"] = player_1

    response = await auth_client_seed.post(f"/games/{jsn['game_id']}/user", json=jsn)

    assert response.status_code == 404


@pytest.mark.asyncio
async def test_frontend_state_edit_no_effect(auth_client_seed):
    jsn = await play_game(auth_client_seed)

    player_1 = jsn["player_1"]
    player_1["hltv"] = 999.9

    jsn["player_1"] = player_1

    response = await auth_client_seed.post(f"/games/{jsn['game_id']}/user", json=jsn)

    assert response.status_code == 200

    data = response.json()

    assert data["score"] < 999.9


@pytest.mark.asyncio
async def test_play_game_wrong_igl(auth_client_seed):
    jsn = await play_game_wrong_igl(auth_client_seed)

    response = await auth_client_seed.post(f"/games/{jsn['game_id']}/user", json=jsn)

    assert response.status_code == 422
