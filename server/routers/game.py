from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from authentication.auth import get_current_lineup
from database.database import get_db
from models.models import Active_Game, User
from schemas import active_game_schemas
from services import game_service

router = APIRouter(prefix="/lineup", tags=["Lineups"])


@router.post(
    path="/user",
    status_code=status.HTTP_200_OK,
    response_model=active_game_schemas.GameEvaluationUser,
)
async def submit_user_lineup(
    game: active_game_schemas.GameResult,
    active_game: Active_Game,
    user: User = Depends(get_current_lineup),
    db: AsyncSession = Depends(get_db),
):
    evaluation = await game_service.evaluate_user_game(
        game=game, active_game=active_game, user=user, db=db
    )
    return evaluation


@router.post(
    path="",
    status_code=status.HTTP_200_OK,
    response_model=active_game_schemas.GameEvaluation,
)
async def submit_lineup(
    game: active_game_schemas.GameResult,
    active_game: Active_Game,
    db: AsyncSession = Depends(get_db),
):
    evaluation = await game_service.evaluate_game(
        game=game, active_game=active_game, db=db
    )
    return evaluation
