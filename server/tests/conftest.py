from collections.abc import AsyncGenerator

import pytest_asyncio
import redis.asyncio as redis
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from cache.redis import get_redis
from database.database import get_db
from main import app
from models.models import Base
from tests.authclient import AuthClient
from tests.helpers import Helpers
from tests.mockdata import data as mock_data

SQLALCHEMY_DATABASE_URL = (
    "postgresql+psycopg://postgres:postgres@localhost:5433/test_db"
)

REDIS_URL = "redis://localhost:6380/0"


@pytest_asyncio.fixture
async def engine() -> AsyncGenerator[AsyncEngine, None]:
    engine = create_async_engine(SQLALCHEMY_DATABASE_URL)

    async with engine.begin() as conn:
        await conn.run_sync(fn=Base.metadata.create_all)

    yield engine

    async with engine.begin() as conn:
        await conn.run_sync(fn=Base.metadata.drop_all)

    await engine.dispose()


@pytest_asyncio.fixture
async def redis_cache() -> AsyncGenerator[redis.Redis, None]:
    rc = redis.Redis.from_url(
        REDIS_URL,
        decode_responses=True,
    )

    await rc.flushdb()

    yield rc

    await rc.flushdb()
    await rc.aclose()


@pytest_asyncio.fixture
async def db(engine: AsyncEngine) -> AsyncGenerator[AsyncSession, None]:
    session_local: async_sessionmaker[AsyncSession] = async_sessionmaker(
        bind=engine, class_=AsyncSession, expire_on_commit=False
    )

    async with session_local() as session:
        yield session
        await session.rollback()


@pytest_asyncio.fixture
async def cache(redis_cache: redis.Redis) -> redis.Redis:
    await redis_cache.set("app:status", "healthy")
    return redis_cache


@pytest_asyncio.fixture
async def client(
    db: AsyncSession, cache: redis.Redis
) -> AsyncGenerator[AsyncClient, None]:
    # ruff: ignore[unused-async]
    async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
        yield db

    # ruff: ignore[unused-async]
    async def override_get_redis() -> AsyncGenerator[redis.Redis, None]:
        yield cache

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_redis] = override_get_redis

    transport = ASGITransport(app=app, raise_app_exceptions=True)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client

    app.dependency_overrides.clear()


# pyrefly: ignore [no-matching-overload]
@pytest_asyncio.fixture
def helpers() -> Helpers:
    return Helpers()


@pytest_asyncio.fixture
async def auth_client(
    client: AsyncClient, db: AsyncSession, cache: redis.Redis, helpers: Helpers
) -> AuthClient:
    user: dict[str, str] = await helpers.full_login(client)

    return AuthClient(client, user, db=db, cache=cache)


@pytest_asyncio.fixture
async def auth_client_seed(
    client: AsyncClient, db: AsyncSession, cache: redis.Redis, helpers: Helpers
) -> AuthClient:
    user: dict[str, str] = await helpers.full_login(client)
    ac = AuthClient(client, user, db=db, cache=cache)
    await ac.seed_data(data=mock_data)
    await ac.seed_cache()
    return ac
