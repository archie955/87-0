from typing import Annotated

from fastapi import Depends, Path

from cache.redis import RedisDep
from exceptions.app_exceptions import DataNotFoundError
from schemas import active_game_schemas


async def get_current_game(
    cache: RedisDep,
    game_id: str = Path(..., description="ID of active game"),
) -> active_game_schemas.ActiveGame:

    game = await cache.get(game_id)

    if not game:
        raise DataNotFoundError(datatype="Active Game")

    return active_game_schemas.ActiveGame.model_validate_json(game)


GameDep = Annotated[active_game_schemas.ActiveGame, Depends(get_current_game)]
