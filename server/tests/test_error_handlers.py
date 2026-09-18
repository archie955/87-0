from fastapi.exceptions import RequestValidationError
from starlette.requests import Request

from exceptions.app_exceptions import DataNotFoundError
from exceptions.steam_exceptions import SteamBadRequestError
from main import (
    app_exception_handler,
    global_expression_handler,
    steam_exception_handler,
    validation_exception_handler,
)
from utils.config import get_settings

settings = get_settings()


def make_request() -> Request:
    return Request(
        {
            "type": "http",
            "method": "GET",
            "path": "/",
            "headers": [],
        }
    )


def test_app_exception_handler():
    response = app_exception_handler(make_request(), DataNotFoundError("User"))

    assert response.status_code == 404
    assert response.body == b'{"detail":"User not found"}'


def test_steam_exception_handler():
    response = steam_exception_handler(make_request(), SteamBadRequestError("bad"))

    assert response.status_code == 303
    assert (
        response.headers["location"]
        == f"{settings.frontend_auth_url}/login?error=SteamBadRequestError"
    )


def test_validation_exception_handler():
    exc = RequestValidationError(
        [
            {
                "loc": ("body", "field"),
                "msg": "required",
                "type": "value_error",
            }
        ]
    )

    response = validation_exception_handler(make_request(), exc)

    assert response.status_code == 422


def test_global_expression_handler():
    response = global_expression_handler(make_request(), Exception("boom"))

    assert response.status_code == 500
    assert response.body == b'{"detail":"Internal server error"}'
