from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from authentication.auth import get_current_lineup
from database.database import get_db
from models.user_model import User
from schemas import lineup_schemas
from services import lineup_service

router = APIRouter(prefix="/lineup", tags=["Lineups"])


@router.post(
    path="",
    status_code=status.HTTP_200_OK,
    response_model=lineup_schemas.LineupEvaluation,
)
async def submit_lineup(
    lineup: lineup_schemas.Lineup,
    user: User = Depends(get_current_lineup),
    db: AsyncSession = Depends(get_db),
):
    score = lineup_service.eval_lineup(lineup)
    best = False
    if score > user.best_game.score:
        best = True
        lineup_service.persist_lineup(lineup, db)

    return lineup_service.evaluation(score, best)


"""Need to add a lineup evaluation for not logged in users too"""
