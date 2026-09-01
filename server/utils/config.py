"""Initialise settings from environment file.

Use Last Recently Used Cache to provide settings without
reinitialisation every time. Provide dependency injection.
"""

from functools import lru_cache
from typing import Annotated

from fastapi import Depends
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """:class:`Settings`.
    Inherits from :class:`pydantic_settings.BaseSettings`.
    """

    secret_key: str
    refresh_secret_key: str
    postgres_hostname: str
    postgres_port: int
    postgres_password: str
    postgres_name: str
    postgres_username: str
    algorithm: str
    access_token_expire_minutes: int
    refresh_token_expire_days: int
    allowed_origins: str
    steam_key: str
    redis_host: str
    redis_port: int
    redis_db: int
    prod: str

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
