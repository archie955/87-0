from fastapi import APIRouter, status

from database.database import DBDep
from schemas import team_schemas
from services import team_service

router = APIRouter(prefix="/teams", tags=["Teams"])


@router.get(path="", status_code=status.HTTP_200_OK, response_model=team_schemas.Teams)
async def get_teams(db: DBDep):
    return await team_service.get(db=db)
