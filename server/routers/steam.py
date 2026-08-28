from fastapi import APIRouter, Request, status
from fastapi.responses import RedirectResponse

from authentication.auth import UserDep
from database.database import DBDep
from schemas import token_schemas
from services import steam_service
from utils.config import SettingsDep

router = APIRouter(prefix="/steam", tags=["Authentication"])


@router.get("", status_code=status.HTTP_303_SEE_OTHER, response_class=RedirectResponse)
def steam_redirect(request: Request):
    return steam_service.redirect(return_url=str(request.url_for("validate_login")))


@router.get(
    "/validatelogin",
    status_code=status.HTTP_200_OK,
    response_model=token_schemas.TokenOut,
)
async def steam_validate_login(request: Request, db: DBDep, settings: SettingsDep):
    return await steam_service.validate(
        db=db, settings=settings, query_params=request.query_params
    )


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
async def steam_delete(
    db: DBDep,
    user: UserDep,
):
    if user.steam_login is not None:
        await steam_service.delete(db=db, steam_user=user.steam_login)
