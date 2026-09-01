from typing import Annotated

from fastapi import APIRouter, Form, Request, status
from fastapi.responses import RedirectResponse

from authentication.auth import UserDep
from database.database import DBDep
from schemas import steam_schemas, token_schemas
from services import steam_service
from utils.config import SettingsDep

router = APIRouter(prefix="/steam", tags=["Authentication"])

FormDep = Annotated[str, Form]


@router.post("", status_code=status.HTTP_303_SEE_OTHER, response_class=RedirectResponse)
async def steam_register(request: Request, db: DBDep, username: FormDep):
    await steam_service.check_username(db=db, username=username)
    return steam_service.redirect(
        return_url=str(request.url_for("steam_validate_register", username=username))
    )


@router.get(
    "/validate/{username}",
    status_code=status.HTTP_200_OK,
    response_model=token_schemas.TokenOut,
)
async def steam_validate_register(
    request: Request, username: str, db: DBDep, settings: SettingsDep
):
    profile = await steam_service.validate_profile(request.query_params)
    return await steam_service.create_steam_login(
        db=db, settings=settings, profile=profile, username=username
    )


@router.get(
    "/login", status_code=status.HTTP_303_SEE_OTHER, response_class=RedirectResponse
)
def steam_login(request: Request):
    return steam_service.redirect(
        return_url=str(request.url_for("steam_validate_login"))
    )


@router.get(
    "/login/validate",
    status_code=status.HTTP_200_OK,
    response_model=token_schemas.TokenOut,
)
async def steam_validate_login(request: Request, db: DBDep, settings: SettingsDep):
    profile = await steam_service.validate_profile(request.query_params)
    return await steam_service.update_steam_login(
        db=db, settings=settings, profile=profile
    )


@router.get(
    "/add", status_code=status.HTTP_303_SEE_OTHER, response_class=RedirectResponse
)
def steam_add(request: Request):
    return steam_service.redirect(
        return_url=str(request.url_for("steam_add_to_account"))
    )


@router.get(
    "/add/validate",
    status_code=status.HTTP_200_OK,
    response_model=steam_schemas.SteamOut,
)
async def steam_add_validate(request: Request, db: DBDep, user: UserDep):
    profile = await steam_service.validate_profile(request.query_params)
    return await steam_service.add_steam_login_to_preexisting_account(
        db=db, profile=profile, user=user
    )


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
async def steam_delete(
    db: DBDep,
    user: UserDep,
):
    if user.steam_login is not None:
        await steam_service.delete(db=db, user=user)
