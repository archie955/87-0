import logging

from fastapi import APIRouter, Request, Response, status

from database.database import DBDep
from services import auth_service
from utils.config import SettingsDep

router = APIRouter(prefix="/auth", tags=["Authentication"])

logger = logging.getLogger(__name__)


@router.post("/refresh", status_code=status.HTTP_200_OK, response_model=Response)
async def refresh(request: Request, db: DBDep, settings: SettingsDep):
    tokens = await auth_service.refresh(request=request, settings=settings, db=db)

    response = Response(status_code=status.HTTP_200_OK)

    return auth_service.set_cookie_headers(
        response=response, tokens=tokens, settings=settings
    )
