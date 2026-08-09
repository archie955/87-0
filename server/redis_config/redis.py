import json
from contextlib import asynccontextmanager

import redis.asyncio as redis
from fastapi import Depends, FastAPI
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from database.database import get_db
from models.igl_model import IGL
from models.team_model import Team
from redis_config.redis_settings import get_redis_settings
from schemas import player_schemas, team_schemas

redis_settings = get_redis_settings()


def igl_score(igl: IGL) -> float:
    """Will calculate the IGL score"""
    print(igl.player_id)
    return 1.2


@asynccontextmanager
async def redis_lifespan(app: FastAPI, db: AsyncSession = Depends(get_db)):
    app.state.redis = redis.from_url(
        redis_settings.get_redis_url(), decode_response=True
    )
    teams = (
        (await db.execute(select(Team).options(selectinload(Team.players, Team.igl))))
        .scalars()
        .all()
    )

    team_ids = []
    for team in teams:
        team_ids.append(team.id)
        players_list = []
        for player in team.players:
            if player.id == team.igl.player_id:
                igl = igl_score(team.igl)
            else:
                igl = None
            p = player_schemas.Player.model_validate(player)
            p.igl_score = igl
            players_list.append(p)
        players = player_schemas.Team_Players(players=players_list)
        t = team_schemas.Team(id=team.id, name=team.name, players=players)
        await app.state.redis.set(str(team.id), t.model_dump_json())
    await app.state.redis.set("team_ids", json.dumps(team_ids))
    yield
    app.state.redis.close()


def get_client(app: FastAPI) -> redis.Redis:
    return app.state.redis
