"""Initialise settings from environment file.

Use Last Recently Used Cache to provide settings without
reinitialisation every time. Provide dependency injection.
"""

from functools import lru_cache
from typing import Annotated, Literal

from fastapi import Depends
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """:class:`Settings`.
    Inherits from :class:`pydantic_settings.BaseSettings`.
    """

    secret_key: Annotated[str, Field(min_length=60)]
    postgres_hostname: str
    postgres_port: int
    postgres_password: str
    postgres_name: str
    postgres_username: str
    algorithm: str
    access_token_expire_minutes: Annotated[int, Field(le=20, ge=10)]
    refresh_token_expire_days: Annotated[int, Field(ge=7, le=30)]
    allowed_origins: str
    steam_key: str
    redis_host: str
    redis_port: int
    redis_db: int
    prod: Literal["prod", "dev"]
    frontend_auth_url: str
    data_version: int

    def is_dev(self) -> bool:
        return self.prod == "dev"

    def is_prod(self) -> bool:
        return self.prod == "prod"

    model_config = SettingsConfigDict(
        env_file=".env.dev", case_sensitive=False, extra="ignore"
    )


@lru_cache
def get_settings():
    """Return instance of :class:`Settings`.
    Decorated by LRU Cache so same instance
    used everywhere.
    """
    return Settings()


SettingsDep = Annotated[Settings, Depends(get_settings)]
