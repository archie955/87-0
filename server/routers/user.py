from fastapi import APIRouter, status

from authentication.auth import UserDep
from database.database import DBDep
from services import user_service

router = APIRouter(prefix="/users", tags=["Users"])


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    db: DBDep,
    user: UserDep,
):
    await user_service.delete(db=db, user=user)
