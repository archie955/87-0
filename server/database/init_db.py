from sqlalchemy import select

from database.database import AsyncSessionLocal
from database.init_players import process_players
from database.init_teams import process_teams
from models.models import Team


async def initialise_db_if_empty() -> None:
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Team.id).limit(1))
        has_teams = result.scalar_one_or_none() is not None

    if has_teams:
        return

    await process_teams()
    await process_players(persist=True)