from typing import Annotated

from fastapi import APIRouter, Depends, Response, status
from fastapi.security.oauth2 import OAuth2PasswordRequestForm

from database.database import DBDep
from schemas import email_schemas
from services import auth_service, email_service
from utils.config import SettingsDep

AuthDep = Annotated[OAuth2PasswordRequestForm, Depends()]

router = APIRouter(prefix="/email", tags=["Authentication"])


@router.post(
    path="",
    status_code=status.HTTP_201_CREATED,
    response_class=Response,
)
async def email_create(
    email_user: email_schemas.EmailCreate, db: DBDep, settings: SettingsDep
):
    tokens = await email_service.create_email(
        db=db, email_user=email_user, settings=settings
    )

    response = Response(status_code=status.HTTP_201_CREATED)

    return auth_service.set_cookie_headers(
        response=response, tokens=tokens, settings=settings
    )


@router.post(path="/login", status_code=status.HTTP_200_OK, response_class=Response)
async def email_login(email_credentials: AuthDep, db: DBDep, settings: SettingsDep):
    tokens = await email_service.login(
        db=db,
        settings=settings,
        email=email_credentials.username,
        password=email_credentials.password,
    )

    response = Response(status_code=status.HTTP_200_OK)

    return auth_service.set_cookie_headers(
        response=response, tokens=tokens, settings=settings
    )
