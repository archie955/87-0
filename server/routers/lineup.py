from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from authentication.auth import get_current_lineup
from database.database import get_db
from models.user_model import User
from schemas import lineup_schemas
from services import lineup_service

router = APIRouter(prefix="/lineup", tags=["Lineups"])


@router.post(
    path="/user",
    status_code=status.HTTP_200_OK,
    response_model=lineup_schemas.LineupEvaluation,
)
async def submit_user_lineup(
    lineup: lineup_schemas.Lineup,
    user: User = Depends(get_current_lineup),
    db: AsyncSession = Depends(get_db),
):
    evaluation = await lineup_service.eval_user(lineup=lineup, user=user, db=db)
    return evaluation


@router.post(
    path="",
    status_code=status.HTTP_200_OK,
    response_model=lineup_schemas.LineupEvaluationNoUser,
)
async def submit_lineup(
    lineup: lineup_schemas.Lineup,
    db: AsyncSession = Depends(get_db),
):
    evaluation = await lineup_service.eval_no_user(lineup=lineup, db=db)
    return evaluation
