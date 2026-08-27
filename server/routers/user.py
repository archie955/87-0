from fastapi import APIRouter, status

from routers.dependencies import AuthDep, DBDep, UserDep
from schemas import user_schemas
from services import user_service
from utils.config import SettingsDep

router = APIRouter(prefix="/users", tags=["Users"])


@router.post(
    path="", status_code=status.HTTP_201_CREATED, response_model=user_schemas.UserOut
)
async def create_user(user: user_schemas.UserCreate, db: DBDep):
    return await user_service.create_user(db=db, user=user)


@router.post(
    path="/login", status_code=status.HTTP_200_OK, response_model=user_schemas.UserToken
)
async def login(user_credentials: AuthDep, db: DBDep, settings: SettingsDep):
    return await user_service.login(
        db=db,
        settings=settings,
        username=user_credentials.username,
        password=user_credentials.password,
    )


@router.put("", status_code=status.HTTP_200_OK, response_model=user_schemas.UserOut)
async def update_user(
    updated_payload: user_schemas.UserUpdate,
    db: DBDep,
    user: UserDep,
):
    return await user_service.update(db=db, user=user, updated=updated_payload)


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    db: DBDep,
    user: UserDep,
):
    await user_service.delete(db=db, user=user)
