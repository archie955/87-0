from fastapi import Depends, Path
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database.database import get_db
from exceptions.app_exceptions import DataNotFoundError
from models.models import Active_Game


async def get_current_game(
    game_id: int = Path(..., description="ID of active game"),
    db: AsyncSession = Depends(get_db),
) -> Active_Game:

    game = (
        await db.execute(select(Active_Game).where(Active_Game.id == game_id))
    ).scalar_one_or_none()

    if not game:
        raise DataNotFoundError(datatype="Active Game")

    return game
