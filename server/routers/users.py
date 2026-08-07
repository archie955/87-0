import logging

from fastapi import APIRouter, Depends, Request, status
from fastapi.responses import RedirectResponse
from fastapi.security.oauth2 import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from authentication import auth
from database.database import get_db
from exceptions.app_exceptions import InvalidCredentialsError
from models.user_model import User
from routers.steam_login import SteamLogin, SteamValidator
from schemas import token_schemas, user_schemas
from services import user_service
from services.helpers import safe_commit, safe_commit_add

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("", status_code=status.HTTP_303_SEE_OTHER, response_class=RedirectResponse)
def redirect(request: Request):
    url = f"{request.url_for('validate_login')}"
    steam = SteamLogin(url)
    return steam.Redirect()


@router.get(
    "/validatelogin",
    status_code=status.HTTP_200_OK,
    response_model=token_schemas.UserToken,
)
async def validate_login(request: Request, db: AsyncSession = Depends(get_db)):
    validator = SteamValidator()
    steamID = validator.ValidateLogin(request.query_params)

    if not steamID or not isinstance(steamID, str):
        raise InvalidCredentialsError()

    profile = validator.FetchDetails()

    existing_user = (
        await db.execute(
            select(User)
            .where(User.steam_id == profile.steam_id)
            .options(selectinload(User.best_game))
        )
    ).scalar_one_or_none()

    if existing_user is None:
        new_user = User(
            username=profile.username,
            url=profile.url,
            avatar=profile.avatar,
            steam_id=profile.steam_id,
        )
        db.add(new_user)
        await safe_commit_add(db=db, datatype="User")
        await db.refresh(new_user)
        id = new_user.id
    else:
        existing_user.username = profile.username
        existing_user.url = profile.url
        existing_user.avatar = profile.avatar
        await safe_commit(db=db, datatype="User")
        await db.refresh(existing_user)
        id = existing_user.id

    user_data = {"sub", str(id)}

    logger.info("User logged in", extra={"user_id": str(id)})

    return token_schemas.UserToken(
        access_token=auth.create_access_token(data=user_data),
        token_type="bearer",
    )


@router.post(
    path="", status_code=status.HTTP_201_CREATED, response_model=user_schemas.UserOut
)
async def create_user(
    user: user_schemas.UserCreate, db: AsyncSession = Depends(get_db)
):
    new_user = await user_service.create_user(db=db, user=user)

    return new_user


@router.post(
    path="/login",
    status_code=status.HTTP_200_OK,
    response_model=token_schemas.UserToken,
)
async def login(
    user_credentials: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
):
    user_token = await user_service.login(
        db=db, username=user_credentials.username, password=user_credentials.password
    )

    return user_token


@router.put("", status_code=status.HTTP_200_OK, response_model=user_schemas.UserOut)
async def update_user(
    updated_payload: user_schemas.UserUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(auth.get_current_user),
):
    updated_user = await user_service.update(db=db, user=user, updated=updated_payload)

    return updated_user


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(auth.get_current_user),
):
    await user_service.delete(db=db, user=user)
    return
