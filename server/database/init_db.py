from utils.config import Settings
from services.helpers import safe_commit_delete, safe_commit
from sqlalchemy import select, delete

from database.database import AsyncSessionLocal
from database.init_players import process_players
from database.init_teams import process_teams
from models import models


async def initialise_db(settings: Settings) -> None:
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(models.Team.id).limit(1))
        has_teams = result.scalar_one_or_none() is not None

        version = (await db.execute(select(
            models.DataVersion
        ).limit(1))).scalar_one_or_none()

        if not version:
            version = models.DataVersion(version=1)
            db.add(version)
            await safe_commit(db=db, datatype="DB Version")
            await db.refresh(version)
        

        if has_teams and version < settings.data_version:

            await db.execute(delete(models.Player))
            await db.execute(delete(models.Team))
            version.version = settings.data_version

            await safe_commit_delete(db=db, datatype="Teams and Players")
        elif has_teams:
            return

    await process_teams()
    await process_players(persist=True)