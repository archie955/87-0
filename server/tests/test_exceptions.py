from exceptions.app_exceptions import (
    BadRequestError,
    DataAlreadyAddedError,
    DataAlreadyExistsError,
    DataNotFoundError,
    ExpiredDataError,
    InvalidCredentialsError,
    InvalidGameLineup,
    PermissionDeniedError,
    RequiredAuthentication,
    UninstantiatedCache,
)
from exceptions.steam_exceptions import (
    SteamBadRequestError,
    SteamDataAlreadyExistsError,
    SteamDataNotFoundError,
    SteamInvalidCredentialsError,
    SteamPermissionDeniedError,
)


def test_app_exceptions():
    assert DataAlreadyExistsError("User").status_code == 409
    assert DataAlreadyExistsError("User").message == "User already exists"

    assert DataAlreadyAddedError("Refresh Token").status_code == 409
    assert (
        DataAlreadyAddedError("Refresh Token").message
        == "Refresh Token has already been added"
    )

    assert InvalidCredentialsError().status_code == 401
    assert BadRequestError("bad").status_code == 400
    assert DataNotFoundError("User").status_code == 404
    assert PermissionDeniedError().status_code == 403
    assert ExpiredDataError("Token").status_code == 422
    assert InvalidGameLineup(1, "reason").status_code == 422
    assert RequiredAuthentication().status_code == 409
    assert UninstantiatedCache().status_code == 404


def test_steam_exceptions():
    assert SteamInvalidCredentialsError().status_code == 401
    assert SteamBadRequestError("bad").status_code == 400
    assert SteamPermissionDeniedError().status_code == 403
    assert SteamDataNotFoundError("User").status_code == 404
    assert SteamDataAlreadyExistsError("User").status_code == 409
