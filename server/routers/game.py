import uuid

from fastapi import APIRouter, Request, status
from fastapi.responses import JSONResponse

from authentication.auth import NullableUserDep
from cache.redis import RedisDep
from database.database import DBDep
from limiter.limiter import limiter
from routers.game_dep import GameDep
from schemas import active_game_schemas
from services import game_service
from utils.config import SettingsDep

router = APIRouter(prefix="/games", tags=["Games"])


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    response_model=active_game_schemas.ActiveGame,
)
@limiter.limit("60/minute")
async def create_game(request: Request, cache: RedisDep, settings: SettingsDep):
    user_id = request.cookies.get("session")
    if not user_id:
        user_id = str(uuid.uuid4())
    game = await game_service.create_game(
        user_id=user_id, cache=cache, request_id=request.state.id
    )
    response = JSONResponse(content=game.model_dump(), status_code=201)
    response.set_cookie(
        "session",
        value=user_id,
        httponly=True,
        secure=settings.prod == "prod",
        samesite="strict" if settings.prod == "prod" else "lax",
    )
    return response


@router.post(
    path="/submit",
    status_code=status.HTTP_200_OK,
    response_model=active_game_schemas.GameEvaluation,
)
@limiter.limit("10/min")
# ruff: ignore[too-many-positional-arguments, too-many-arguments]
async def submit_lineup(
    request: Request,
    game: active_game_schemas.GameResult,
    active_game: GameDep,
    user: NullableUserDep,
    db: DBDep,
    cache: RedisDep,
):
    return await game_service.game_evaluation(
        game=game,
        active_game=active_game,
        user=user,
        db=db,
        cache=cache,
        request_id=request.state.id,
    )
