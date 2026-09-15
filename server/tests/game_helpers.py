import json

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from models.models import Player, Team
from schemas import player_schemas, team_schemas
from tests.authclient import AuthClient
from tests.mockdata import data


async def seed_data(
    db: AsyncSession,
) -> None:
    for team_data in data["teams"]:
        db.add(Team(name=team_data["name"]))

    await db.flush()

    teams = (await db.execute(select(Team))).scalars().all()
    teams_by_name = {team.name: team for team in teams}

    for player_data in data["players"]:
        db.add(
            Player(
                name=player_data["name"],
                role=player_data["role"],
                hltv=player_data["hltv"],
                igl_score=player_data["igl_score"],
                odds=player_data["odds"],
                igl_odds=player_data["igl_odds"],
                majors=player_data["majors"],
                wins=player_data["wins"],
                second=player_data["second"],
                semi=player_data["semi"],
                quarter=player_data["quarter"],
                total_tournaments=player_data["total_tournaments"],
                major_teammates=player_data["major_teammates"],
                win_teammates=player_data["win_teammates"],
                team=teams_by_name[player_data["team_name"]],
            )
        )

    await db.flush()


async def seed_cache(
    db: AsyncSession,
    cache,
) -> None:
    teams = (
        (await db.execute(select(Team).options(selectinload(Team.players))))
        .scalars()
        .all()
    )

    team_dict = {}
    team_ids = []

    for team in teams:
        team_dict[team.id] = team_schemas.Team(
            id=team.id,
            name=team.name,
            players=[
                player_schemas.Player.model_validate(player) for player in team.players
            ],
        )
        team_ids.append(team.id)

    teams_schema = team_schemas.Teams.model_validate(team_dict)

    categories = {
        "cat_1": 1.5,
        "cat_2": 1.0,
        "cat_3": 0.7,
        "cat_4": 0.2,
        "cat_5": -0.2,
    }

    await cache.set("teams", teams_schema.model_dump_json())
    await cache.set("team_ids", json.dumps(team_ids))
    await cache.set("categories", json.dumps(categories))


async def create_game(auth_client: AuthClient) -> dict:
    response = await auth_client.post("/games")

    assert response.status_code == 201

    return response.json()


async def get_teams(auth_client: AuthClient) -> dict:
    response = await auth_client.get("/teams")

    assert response.status_code == 200

    return response.json()
