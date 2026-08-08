import redis.asyncio as redis

from redis_config.redis_settings import get_redis_settings

redis_settings = get_redis_settings()

client: redis.Redis = redis.from_url(
    redis_settings.get_redis_url(),
    decode_response=True,
)


def get_client() -> redis.Redis:
    return client
