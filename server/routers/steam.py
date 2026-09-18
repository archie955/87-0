import uuid
from typing import Annotated

from fastapi import APIRouter, Form, Request, status
from fastapi.responses import RedirectResponse

from database.database import DBDep
from exceptions.steam_exceptions import SteamInvalidCredentialsError
from limiter.limiter import limiter
from services import auth_service, steam_service
from utils.config import SettingsDep

router = APIRouter(prefix="/steam", tags=["Authentication"])

FormDep = Annotated[str, Form(..., max_length=100)]


@router.post("", status_code=status.HTTP_303_SEE_OTHER, response_class=RedirectResponse)
@limiter.limit("10/min")
async def steam_register(
    request: Request, db: DBDep, settings: SettingsDep, username: FormDep
):
    await steam_service.check_username(db=db, username=username)
    state = str(uuid.uuid4())
    if settings.prod == "prod":
        url = f"{settings.frontend_auth_url}/api/steam/validate/{username}"
    else:
        url = f"{settings.frontend_auth_url}/steam/validate/{username}"

    return steam_service.redirect(
        return_url=url, state=state, request_id=request.state.id
    )


@router.get(
    "/validate/{username}",
    status_code=status.HTTP_303_SEE_OTHER,
    response_class=RedirectResponse,
)
@limiter.exempt
async def steam_validate_register(
    request: Request, username: str, db: DBDep, settings: SettingsDep
):
    state = request.cookies.get("state")
    if not state:
        raise SteamInvalidCredentialsError()
    profile = await steam_service.validate_profile(
        query_params=request.query_params,
        session_state=state,
        key=settings.steam_key,
        request_id=request.state.id,
    )

    tokens = await steam_service.create_steam_login(
        db=db,
        settings=settings,
        profile=profile,
        username=username,
        request_id=request.state.id,
    )

    response = RedirectResponse(
        url=f"{settings.frontend_auth_url}/account",
        status_code=status.HTTP_303_SEE_OTHER,
    )

    return auth_service.set_cookie_headers(
        response=response, tokens=tokens, settings=settings
    )


@router.get(
    "/login", status_code=status.HTTP_303_SEE_OTHER, response_class=RedirectResponse
)
@limiter.limit("10/min")
async def steam_login(request: Request, settings: SettingsDep):
    state = str(uuid.uuid4())
    if settings.prod == "prod":
        url = f"{settings.frontend_auth_url}/api/steam/login/validate"
    else:
        url = f"{settings.frontend_auth_url}/steam/login/validate"

    return steam_service.redirect(
        return_url=url, state=state, request_id=request.state.id
    )


@router.get(
    "/login/validate",
    status_code=status.HTTP_303_SEE_OTHER,
    response_class=RedirectResponse,
)
@limiter.exempt
async def steam_validate_login(request: Request, db: DBDep, settings: SettingsDep):
    state = request.cookies.get("state")
    if not state:
        raise SteamInvalidCredentialsError()
    profile = await steam_service.validate_profile(
        query_params=request.query_params,
        session_state=state,
        key=settings.steam_key,
        request_id=request.state.id,
    )

    tokens = await steam_service.update_steam_login(
        db=db, settings=settings, profile=profile
    )

    response = RedirectResponse(
        url=f"{settings.frontend_auth_url}/account",
        status_code=status.HTTP_303_SEE_OTHER,
    )

    return auth_service.set_cookie_headers(
        response=response, tokens=tokens, settings=settings
    )
