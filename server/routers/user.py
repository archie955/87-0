from fastapi import APIRouter, Request, status

from authentication.auth import UserDep
from database.database import DBDep
from schemas import user_schemas
from services import user_service

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("", status_code=status.HTTP_200_OK, response_model=user_schemas.UserOut)
async def get_user(request: Request, user: UserDep):
    return user_schemas.UserOut.model_validate(user)


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    request: Request,
    db: DBDep,
    user: UserDep,
):
    await user_service.delete(db=db, user=user)


@router.put("", status_code=status.HTTP_200_OK, response_model=user_schemas.UserOut)
async def update_user(db: DBDep, user: UserDep, updated: user_schemas.UserUpdate):
    return await user_service.update(db=db, user=user, updated=updated)
