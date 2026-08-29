import json

import redis.asyncio as redis
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from database import init_db
from exceptions.app_exceptions import DataNotFoundError
from models import models


async def initialise_db_and_cache(db: AsyncSession, cache: redis.Redis) -> None:
    teams = (
        (
            await db.execute(
                select(models.Team).options(selectinload(models.Team.players))
            )
        )
        .scalars()
        .all()
    )

    if not teams:
        init_db.main()
        teams = (
            (
                await db.execute(
                    select(models.Team).options(selectinload(models.Team.players))
                )
            )
            .scalars()
            .all()
        )

    if not teams:
        raise DataNotFoundError(datatype="Teams")

    team_ids = []

    async with cache.pipeline(transaction=False) as pipe:
        for team in teams:
            pipe.set(
                f"team:{team.id}",
                json.dumps(
                    {
                        "id": team.id,
                        "name": team.name,
                        "players": [
                            {
                                "id": player.id,
                                "team_id": player.team_id,
                                "name": player.name,
                                "role": player.role,
                                "hltv": player.hltv,
                                "igl_bonus": player.igl_bonus,
                            }
                            for player in team.players
                        ],
                    }
                ),
            )
            team_ids.append(team.id)
        pipe.set("team_ids", json.dumps(team_ids))
        await pipe.execute()
