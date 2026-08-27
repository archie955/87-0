from typing import Annotated

from fastapi import Depends, Path
from sqlalchemy import select

from database.database import DBDep
from exceptions.app_exceptions import DataNotFoundError
from models.models import Active_Game


async def get_current_game(
    db: DBDep,
    game_id: int = Path(..., description="ID of active game"),
) -> Active_Game:

    game = (
        await db.execute(select(Active_Game).where(Active_Game.id == game_id))
    ).scalar_one_or_none()

    if not game:
        raise DataNotFoundError(datatype="Active Game")

    return game


GameDep = Annotated[Active_Game, Depends(get_current_game)]
