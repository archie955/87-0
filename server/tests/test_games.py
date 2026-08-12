import pytest


@pytest.mark.asyncio
async def test_create_game(auth_client_seed):
    response = await auth_client_seed.get("/games")

    assert response.status_code == 201

    data = response.json()

    assert "id" in data
    assert "team_1_id" in data
    assert "team_2_id" in data
    assert "team_3_id" in data
    assert "team_4_id" in data
    assert "team_5_id" in data
    assert "team_6_id" in data
