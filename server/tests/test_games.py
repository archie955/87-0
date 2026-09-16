from httpx import Cookies

from tests.game_helpers import (
    play_game,
    play_game_switch_team,
    play_game_wrong_igl,
)

# ---------------------------------------------------------------------------
# Router-level: POST /games
# ---------------------------------------------------------------------------


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


async def test_create_game_no_teams(auth_client):
    response = await auth_client.post("/games")

    assert response.status_code == 404


# ---------------------------------------------------------------------------
# Router-level: POST /games/{id}
# ---------------------------------------------------------------------------


async def test_play_game_user(auth_client_seed):
    game_submission = await play_game(auth_client_seed)

    response = await auth_client_seed.post(
        "/games/submit",
        json=game_submission,
    )

    assert response.status_code == 200

    data = response.json()

    assert "score" in data
    assert "cat" in data
    assert "best" in data

    assert isinstance(data["score"], float)
    assert data["best"]


async def test_play_game(auth_client_seed):
    game_submission = await play_game(auth_client_seed)
    session = auth_client_seed.client.cookies.get("session")

    assert session

    auth_client_seed.client.cookies.clear()

    cookies = Cookies({"session": session})

    response = await auth_client_seed.noauth_post(
        "/games/submit",
        json=game_submission,
        cookies=cookies,
    )

    assert response.status_code == 200

    data = response.json()

    assert "score" in data
    assert "cat" in data
    assert "best" in data

    assert isinstance(data["score"], float)
    assert not data["best"]


async def test_play_game_wrong_team_id(auth_client_seed):
    game_submission = await play_game_switch_team(auth_client_seed)

    response = await auth_client_seed.post(
        "/games/submit",
        json=game_submission,
    )

    assert response.status_code == 422


async def test_play_game_wrong_number_of_players(auth_client_seed):
    game_submission = await play_game(auth_client_seed)

    del game_submission["player_5"]

    response = await auth_client_seed.post(
        "/games/submit",
        json=game_submission,
    )

    assert response.status_code == 422


async def test_play_game_fake_player(auth_client_seed):
    game_submission = await play_game(auth_client_seed)

    game_submission["player_1"]["id"] = 100

    response = await auth_client_seed.post(
        "/games/submit",
        json=game_submission,
    )

    assert response.status_code == 404


async def test_frontend_state_edit_no_effect(auth_client_seed):
    game_submission = await play_game(auth_client_seed)

    game_submission["player_1"]["hltv"] = 999.9

    response = await auth_client_seed.post(
        "/games/submit",
        json=game_submission,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["score"] < 999.9


async def test_play_game_wrong_igl(auth_client_seed):
    game_submission = await play_game_wrong_igl(auth_client_seed)

    response = await auth_client_seed.post(
        "/games/submit",
        json=game_submission,
    )

    assert response.status_code == 422
