import logging
from datetime import UTC, datetime

from fastapi import APIRouter, Request, Response, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from authentication.auth import (
    create_access_token,
    create_refresh_token,
    verify_refresh_token,
)
from database.database import DBDep
from exceptions.app_exceptions import DataNotFoundError, InvalidCredentialsError
from models import models
from schemas import token_schemas
from services import auth_service
from services.helpers import safe_commit
from utils.config import SettingsDep

router = APIRouter(prefix="/auth", tags=["Authentication"])

logger = logging.getLogger(__name__)


@router.post("/refresh", status_code=status.HTTP_200_OK, response_model=Response)
async def refresh(request: Request, db: DBDep, settings: SettingsDep):
    refresh_token = request.cookies.get("refresh_token")

    if not refresh_token:
        raise InvalidCredentialsError()

    token = verify_refresh_token(token=refresh_token, settings=settings)

    user = (
        await db.execute(
            select(models.User)
            .where(models.User.id == token.id)
            .options(selectinload(models.User.refresh))
        )
    ).scalar_one_or_none()

    if not user:
        raise DataNotFoundError(datatype="User")

    old_token = user.refresh

    if not old_token or not old_token.jti == token.jti:
        raise InvalidCredentialsError()

    if old_token.expires_at < datetime.now(tz=UTC):
        raise InvalidCredentialsError()

    await db.delete(old_token)

    user_data = {"sub": str(user.id)}

    new_access_token = create_access_token(data=user_data, settings=settings)

    new_refresh = create_refresh_token(data=user_data, settings=settings)

    refresh = models.RefreshToken(
        expires_at=new_refresh.expires_at,
        jti=new_refresh.jti,
        user=user,
    )

    db.add(refresh)
    await safe_commit(db=db, datatype="Refresh Token")

    response = Response(status_code=status.HTTP_200_OK)

    tokens = token_schemas.Tokens(
        access_token=new_access_token,
        refresh_token=new_refresh.token,
    )

    logger.info("New tokens created", extra={"user_id": user.id})

    return auth_service.set_cookie_headers(
        response=response, tokens=tokens, settings=settings
    )
