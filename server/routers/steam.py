from typing import Annotated

from fastapi import APIRouter, Form, Request, status
from fastapi.responses import RedirectResponse

from database.database import DBDep
from services import auth_service, steam_service
from utils.config import SettingsDep

router = APIRouter(prefix="/steam", tags=["Authentication"])

FormDep = Annotated[str, Form(...)]


@router.post("", status_code=status.HTTP_303_SEE_OTHER, response_class=RedirectResponse)
async def steam_register(request: Request, db: DBDep, username: FormDep):
    await steam_service.check_username(db=db, username=username)
    return steam_service.redirect(
        return_url=str(request.url_for("steam_validate_register", username=username))
    )


@router.get(
    "/validate/{username}",
    status_code=status.HTTP_303_SEE_OTHER,
    response_class=RedirectResponse,
)
async def steam_validate_register(
    request: Request, username: str, db: DBDep, settings: SettingsDep
):
    profile = await steam_service.validate_profile(request.query_params)

    tokens = await steam_service.create_steam_login(
        db=db, settings=settings, profile=profile, username=username
    )

    response = RedirectResponse(
        url=settings.frontend_auth_url, status_code=status.HTTP_303_SEE_OTHER
    )

    return auth_service.set_cookie_headers(
        response=response, tokens=tokens, settings=settings
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
    status_code=status.HTTP_303_SEE_OTHER,
    response_class=RedirectResponse,
)
async def steam_validate_login(request: Request, db: DBDep, settings: SettingsDep):
    profile = await steam_service.validate_profile(request.query_params)

    tokens = await steam_service.update_steam_login(
        db=db, settings=settings, profile=profile
    )

    response = RedirectResponse(
        url=settings.frontend_auth_url, status_code=status.HTTP_303_SEE_OTHER
    )

    return auth_service.set_cookie_headers(
        response=response, tokens=tokens, settings=settings
    )
