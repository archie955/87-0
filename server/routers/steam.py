from fastapi import APIRouter, Request, status
from fastapi.responses import RedirectResponse

from routers.dependencies import DBDep, UserDep
from schemas import token_schemas
from services import steam_service

router = APIRouter(prefix="/steam", tags=["Users"])


@router.get("", status_code=status.HTTP_303_SEE_OTHER, response_class=RedirectResponse)
def redirect(request: Request):
    url = f"{request.url_for('validate_login')}"
    return steam_service.redirect(url)


@router.get(
    "/validatelogin",
    status_code=status.HTTP_200_OK,
    response_model=token_schemas.UserToken,
)
async def validate_login(request: Request, db: DBDep):
    return await steam_service.validate(db=db, query_params=request.query_params)


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    db: DBDep,
    user: UserDep,
):
    await steam_service.delete(db=db, user=user)
