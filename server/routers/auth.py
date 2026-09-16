import logging

from fastapi import APIRouter, Request, Response, status

from database.database import DBDep
from limiter.limiter import limiter
from services import auth_service
from utils.config import SettingsDep

router = APIRouter(prefix="/auth", tags=["Authentication"])

logger = logging.getLogger(__name__)


@router.post("/refresh", status_code=status.HTTP_200_OK, response_class=Response)
@limiter.limit("100/minute")
async def refresh(request: Request, db: DBDep, settings: SettingsDep):
    tokens = await auth_service.refresh(request=request, settings=settings, db=db)

    response = Response(status_code=status.HTTP_200_OK)

    return auth_service.set_cookie_headers(
        response=response, tokens=tokens, settings=settings
    )


@router.post("/logout", status_code=status.HTTP_200_OK, response_model=None)
@limiter.limit("10/min")
async def logout(request: Request, db: DBDep, settings: SettingsDep):
    await auth_service.logout(request=request, db=db, settings=settings)

    response = Response(status_code=status.HTTP_200_OK)

    return auth_service.clear_cookie_headers(response=response, settings=settings)
