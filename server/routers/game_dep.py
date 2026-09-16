from typing import Annotated

from fastapi import Depends, Request

from cache.redis import RedisDep
from exceptions.app_exceptions import DataNotFoundError
from schemas import active_game_schemas


async def get_current_game(
    request: Request,
    cache: RedisDep,
) -> active_game_schemas.ActiveGame:

    session = request.cookies.get("session")

    if not session:
        raise DataNotFoundError(datatype="session")

    game_id = await cache.get(session)

    if not game_id:
        raise DataNotFoundError(datatype="Active game")

    game = await cache.get(game_id)

    if not game:
        raise DataNotFoundError(datatype="Active Game")

    return active_game_schemas.ActiveGame.model_validate_json(game)


GameDep = Annotated[active_game_schemas.ActiveGame, Depends(get_current_game)]
