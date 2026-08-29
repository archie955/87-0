from typing import Annotated

import redis.asyncio as redis
from fastapi import Depends, Request

from utils.config import get_settings

settings = get_settings()


def create_redis() -> redis.Redis:
    return redis.Redis.from_url(
        f"redis://{settings.redis_host}:{settings.redis_port}/{settings.redis_db}",
        decode_responses=True,
    )


def get_redis(request: Request) -> redis.Redis:
    return request.app.state.redis


RedisDep = Annotated[redis.Redis, Depends(get_redis)]
