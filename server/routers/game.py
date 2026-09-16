from fastapi import APIRouter, Request, status

from authentication.auth import NullableUserDep
from cache.redis import RedisDep
from database.database import DBDep
from limiter.limiter import limiter
from routers.game_dep import GameDep
from schemas import active_game_schemas
from services import game_service

router = APIRouter(prefix="/games", tags=["Games"])


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    response_model=active_game_schemas.ActiveGame,
)
@limiter.limit("60/minute")
async def create_game(request: Request, cache: RedisDep):
    return await game_service.create_game(cache=cache)


@router.post(
    path="/{game_id}",
    status_code=status.HTTP_200_OK,
    response_model=active_game_schemas.GameEvaluation,
)
@limiter.limit("10/min")
# ruff: ignore[too-many-positional-arguments, too-many-arguments]
async def submit_lineup(
    request: Request,
    game_id: str,
    game: active_game_schemas.GameResult,
    active_game: GameDep,
    user: NullableUserDep,
    db: DBDep,
    cache: RedisDep,
):
    return await game_service.game_evaluation(
        game=game, active_game=active_game, user=user, db=db, cache=cache
    )
