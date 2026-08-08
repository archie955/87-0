from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from redis import Redis
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

    for team in teams:
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
        app.state.redis.set(str(team.id), t.model_dump_json())
    yield
    app.state.redis.close()
