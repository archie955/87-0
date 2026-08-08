from functools import lru_cache

from pydantic_settings import BaseSettings

from utils.config import settings


class RedisSettings(BaseSettings):
    host: str = settings.redis_host
    port: int = settings.redis_port
    db: int = settings.redis_db

    def get_redis_url(self) -> str:
        return f"redis://{self.host}:{self.port}/{self.db}"


@lru_cache
def get_redis_settings() -> RedisSettings:
    return RedisSettings()
