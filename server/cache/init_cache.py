import json

import redis.asyncio as redis
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from database.database import AsyncSessionLocal
from database.init_players import process_players
from exceptions.app_exceptions import DataNotFoundError
from models import models
from schemas import player_schemas, team_schemas


async def initialise_cache(cache: redis.Redis) -> dict[str, str]:
    categories = await process_players(persist=False)

    async with AsyncSessionLocal() as db:
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

        team_dict = {}
        team_ids = []

        for t in teams:
            team_dict[t.id] = team_schemas.Team(
                # pyrefly: ignore [bad-argument-type]
                id=t.id,
                # pyrefly: ignore [bad-argument-type]
                name=t.name,
                players=[player_schemas.Player.model_validate(p) for p in t.players],
            )
            team_ids.append(t.id)
        teams = team_schemas.Teams.model_validate(team_dict)

    await cache.set("teams", teams.model_dump_json())
    await cache.set("team_ids", json.dumps(team_ids))
    await cache.set("categories", json.dumps(categories))

    return {"status": "Success"}
