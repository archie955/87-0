import logging
from datetime import UTC, datetime

from fastapi.requests import Request
from fastapi.responses import RedirectResponse, Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from authentication.auth import (
    create_access_token,
    create_refresh_token,
    verify_refresh_token,
)
from exceptions.app_exceptions import DataNotFoundError, InvalidCredentialsError
from models import models
from schemas import token_schemas
from services.helpers import safe_commit_add
from utils.config import Settings

logger = logging.getLogger(__name__)


def set_cookie_headers(
    response: Response | RedirectResponse,
    tokens: token_schemas.Tokens,
    settings: Settings,
):
    response.set_cookie(
        key="access_token",
        value=tokens.access_token,
        httponly=True,
        secure=settings.prod == "prod",
        samesite="strict" if settings.prod == "prod" else "lax",
    )

    response.set_cookie(
        key="refresh_token",
        # pyrefly: ignore [bad-argument-type]
        value=tokens.refresh_token,
        httponly=True,
        secure=settings.prod == "prod",
        samesite="strict" if settings.prod == "prod" else "lax",
    )

    return response


async def refresh(
    request: Request, settings: Settings, db: AsyncSession
) -> token_schemas.Tokens:
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
    await safe_commit_add(db=db, datatype="Refresh Token")

    logger.info("New tokens created", extra={"user_id": user.id})

    return token_schemas.Tokens(
        access_token=new_access_token, refresh_token=new_refresh.token
    )
