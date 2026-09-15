from unittest.mock import Mock

from cache.redis import create_redis, get_redis
from utils.config import get_settings

settings = get_settings()


def test_create_redis():
    client = create_redis()

    assert client.connection_pool.connection_kwargs["host"] == settings.redis_host
    assert client.connection_pool.connection_kwargs["port"] == settings.redis_port
    assert client.connection_pool.connection_kwargs["db"] == settings.redis_db


def test_get_redis_from_request():
    fake_redis = Mock()
    request = Mock()
    request.app.state.redis = fake_redis

    assert get_redis(request) is fake_redis
