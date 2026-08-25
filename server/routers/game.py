from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from authentication.auth import get_current_user
from database.database import get_db
from models.models import Active_Game, User
from routers.game_dep import get_current_game
from schemas import active_game_schemas
from services import game_service

router = APIRouter(prefix="/games", tags=["Games"])


@router.post(
    "", status_code=status.HTTP_201_CREATED, response_model=active_game_schemas.Game
)
async def create_game(db: AsyncSession = Depends(get_db)):
    game = await game_service.create_game(db=db)
    return game


@router.post(
    path="/{game_id}/user",
    status_code=status.HTTP_200_OK,
    response_model=active_game_schemas.GameEvaluation,
)
async def submit_user_lineup(
    game_id: int,
    game: active_game_schemas.GameResult,
    active_game: Active_Game = Depends(get_current_game),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    evaluation = await game_service.evaluate_user_game(
        game=game, active_game=active_game, user=user, db=db
    )
    return evaluation


@router.post(
    path="/{game_id}",
    status_code=status.HTTP_200_OK,
    response_model=active_game_schemas.GameEvaluation,
)
async def submit_lineup(
    game_id: int,
    game: active_game_schemas.GameResult,
    active_game: Active_Game = Depends(get_current_game),
    db: AsyncSession = Depends(get_db),
):
    evaluation = await game_service.evaluate_game(
        game=game, active_game=active_game, db=db
    )
    return evaluation
