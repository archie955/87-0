from fastapi.responses import RedirectResponse, Response

from schemas import token_schemas
from utils.config import Settings


def set_cookie_headers(
    response: Response | RedirectResponse,
    tokens: token_schemas.Tokens,
    settings: Settings,
):
    response.set_cookie(
        key="access_token",
        value=tokens.access_token,
        httponly=True,
        secure=settings.prod == "prod",
        samesite="strict" if settings.prod == "prod" else "lax",
    )

    response.set_cookie(
        key="refresh_token",
        # pyrefly: ignore [bad-argument-type]
        value=tokens.refresh_token,
        httponly=True,
        secure=settings.prod == "prod",
        samesite="strict" if settings.prod == "prod" else "lax",
    )

    return response
