import json
from contextlib import asynccontextmanager
from random import randint

from fastapi import Depends, FastAPI
from redis.asyncio import Redis
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from database.database import get_db
from models.igl_model import IGL
from models.team_model import Team
from schemas import player_schemas, team_schemas


def igl_score(igl: IGL) -> float:
    """Will calculate the IGL score"""
    print(igl.player_id)
    return 1.2


@asynccontextmanager
async def redis_lifespan(app: FastAPI, db: AsyncSession = Depends(get_db)):
    app.state.redis = Redis(host="localhost", port=6379)
    teams = (
        (await db.execute(select(Team).options(selectinload(Team.players, Team.igl))))
        .scalars()
        .all()
    )

    team_ids = []
    for team in teams:
        team_ids.append(team.id)
        players = []
        for player in team.players:
            if player.id == team.igl.player_id:
                igl = igl_score(team.igl)
            else:
                igl = None
            p = player_schemas.Player.model_validate(player)
            p.igl_score = igl
            players.append(p)
        t = team_schemas.Team(id=team.id, name=team.name, players=players)
        await app.state.redis.set(str(team.id), t.model_dump_json())
    await app.state.redis.set("team_ids", json.dumps(team_ids))
    yield
    app.state.redis.close()


async def get_teams(redis: Redis):
    team_ids_string: str = await redis.get("team_ids")
    team_ids: list[int] = json.loads(team_ids_string)
    n = len(team_ids)
    data = {}
    for i in range(6):
        data[i] = await redis.get(str(team_ids[randint(0, n - 1)]))
    return data
