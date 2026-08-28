from fastapi import APIRouter, status

from authentication.auth import UserDep
from database.database import DBDep
from routers.game_dep import GameDep
from schemas import active_game_schemas
from services import game_service

router = APIRouter(prefix="/games", tags=["Games"])


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    response_model=active_game_schemas.ActiveGame,
)
async def create_game(db: DBDep):
    return await game_service.create_game(db=db)


@router.post(
    path="/{game_id}/user",
    status_code=status.HTTP_200_OK,
    response_model=active_game_schemas.GameEvaluation,
)
async def submit_user_lineup(
    game_id: int,
    game: active_game_schemas.GameResult,
    active_game: GameDep,
    user: UserDep,
    db: DBDep,
):
    return await game_service.evaluate_user_game(
        game=game, active_game=active_game, user=user, db=db
    )


@router.post(
    path="/{game_id}",
    status_code=status.HTTP_200_OK,
    response_model=active_game_schemas.GameEvaluation,
)
async def submit_lineup(
    game_id: int,
    game: active_game_schemas.GameResult,
    active_game: GameDep,
    db: DBDep,
):
    return await game_service.evaluate_game(game=game, active_game=active_game, db=db)
