from services.helpers import safe_commit_delete
from sqlalchemy import select, delete

from database.database import AsyncSessionLocal
from database.init_players import process_players
from database.init_teams import process_teams
from models import models


async def initialise_db() -> None:
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(models.Team.id).limit(1))
        has_teams = result.scalar_one_or_none() is not None

        if has_teams:

            await db.execute(delete(models.Player))
            await db.execute(delete(models.Team))

            await safe_commit_delete(db=db, datatype="Teams and Players")

    await process_teams()
    await process_players(persist=True)