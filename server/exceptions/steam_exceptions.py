class SteamException(Exception):  # ruff: ignore[error-suffix-on-exception-name]
    def __init__(
        self, status_code: int, message: str, headers: dict[str, str] | None = None
    ):
        self.status_code = status_code
        self.message = message
        self.headers = headers
        super().__init__(message)


class SteamInvalidCredentialsError(SteamException):
    def __init__(self, headers: dict[str, str] | None = None):
        super().__init__(
            status_code=401, message="Invalid credentials provided", headers=headers
        )


class SteamBadRequestError(SteamException):
    def __init__(self, message: str, headers: dict[str, str] | None = None):
        super().__init__(status_code=400, message=message, headers=headers)


class SteamPermissionDeniedError(SteamException):
    def __init__(self, headers: dict[str, str] | None = None):
        super().__init__(
            status_code=403,
            message="You do not have permission to perform this action",
            headers=headers,
        )


class SteamDataNotFoundError(SteamException):
    def __init__(self, datatype: str, headers: dict[str, str] | None = None):
        super().__init__(
            status_code=404, message=f"{datatype} not found", headers=headers
        )


class SteamDataAlreadyExistsError(SteamException):
    def __init__(self, datatype: str, headers: dict[str, str] | None = None):
        super().__init__(
            status_code=409, message=f"{datatype} already exists", headers=headers
        )
