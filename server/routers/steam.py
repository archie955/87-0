from fastapi import APIRouter, Depends, Request, status
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession

from authentication import auth
from database.database import get_db
from models.user_model import User
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
async def validate_login(request: Request, db: AsyncSession = Depends(get_db)):
    user_token = await steam_service.validate(db=db, query_params=request.query_params)
    return user_token


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(auth.get_current_user),
):
    await steam_service.delete(db=db, user=user)
    return
