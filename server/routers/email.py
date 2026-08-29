from typing import Annotated

from fastapi import APIRouter, Depends, status
from fastapi.security.oauth2 import OAuth2PasswordRequestForm

from authentication.auth import UserDep
from database.database import DBDep
from schemas import email_schemas, token_schemas
from services import email_service
from utils.config import SettingsDep

AuthDep = Annotated[OAuth2PasswordRequestForm, Depends()]

router = APIRouter(prefix="/email", tags=["Authentication"])


@router.post(
    path="",
    status_code=status.HTTP_201_CREATED,
    response_model=email_schemas.EmailOut,
)
async def email_create(email_user: email_schemas.EmailCreate, db: DBDep):
    return await email_service.create_email(db=db, email_user=email_user)


@router.post(
    path="/login", status_code=status.HTTP_200_OK, response_model=token_schemas.TokenOut
)
async def email_login(email_credentials: AuthDep, db: DBDep, settings: SettingsDep):
    return await email_service.login(
        db=db,
        settings=settings,
        email=email_credentials.username,
        password=email_credentials.password,
    )


@router.post(
    path="/add",
    status_code=status.HTTP_201_CREATED,
    response_model=email_schemas.EmailOut,
)
async def email_add(email_profile: email_schemas.EmailCreate, db: DBDep, user: UserDep):
    return await email_service.add_email_login_to_preexisting_account(
        db=db, email_profile=email_profile, user=user
    )


@router.put(
    path="", status_code=status.HTTP_200_OK, response_model=email_schemas.EmailOut
)
async def email_update(
    updated_payload: email_schemas.EmailUpdate, db: DBDep, user: UserDep
):
    return await email_service.update(
        db=db, user=user.email_login, updated=updated_payload
    )


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
async def email_delete(
    db: DBDep,
    user: UserDep,
):
    await email_service.delete(db=db, user=user)
