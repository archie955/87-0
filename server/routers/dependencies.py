from typing import Annotated

from fastapi import Depends, Path
from fastapi.security.oauth2 import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from authentication.auth import get_current_user
from database.database import get_db
from exceptions.app_exceptions import DataNotFoundError
from models.models import Active_Game, User

DBDep = Annotated[AsyncSession, Depends(get_db)]


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


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

UserDep = Annotated[User, Depends(get_current_user)]
AuthDep = Annotated[OAuth2PasswordRequestForm, Depends()]
BearerDep = Annotated[str, Depends(oauth2_scheme)]
GameDep = Annotated[Active_Game, Depends(get_current_game)]
