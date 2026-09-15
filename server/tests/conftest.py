import asyncio

# ruff: ignore[suspicious-pickle-import]
import pickle
from collections.abc import AsyncGenerator
from pathlib import Path

import pytest_asyncio
import redis.asyncio as redis
from asgi_lifespan import LifespanManager
from httpx import ASGITransport, AsyncClient
from pygam import LogisticGAM
from sqlalchemy.ext.asyncio import (
    AsyncConnection,
    AsyncEngine,
    AsyncSession,
    create_async_engine,
)

from cache.redis import get_redis
from database.database import get_db
from main import app
from ml.ml_model import get_model
from models.models import Base
from tests.authclient import AuthClient
from tests.game_helpers import seed_cache, seed_data
from tests.helpers import register_user

SQLALCHEMY_DATABASE_URL = (
    "postgresql+psycopg://postgres:postgres@localhost:5433/test_db"
)

REDIS_URL = "redis://localhost:6380/0"

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "ml" / "gam.pkl"


@pytest_asyncio.fixture(scope="session")
async def engine() -> AsyncGenerator[AsyncEngine, None]:
    engine = create_async_engine(SQLALCHEMY_DATABASE_URL)

    async with engine.begin() as conn:
        await conn.run_sync(fn=Base.metadata.create_all)

    yield engine

    async with engine.begin() as conn:
        await conn.run_sync(fn=Base.metadata.drop_all)

    await engine.dispose()


@pytest_asyncio.fixture(scope="session")
async def redis_client() -> AsyncGenerator[redis.Redis, None]:
    rc = redis.Redis.from_url(
        REDIS_URL,
        decode_responses=True,
    )

    await rc.flushdb()

    yield rc

    await rc.flushdb()
    await rc.aclose()


@pytest_asyncio.fixture(scope="session")
async def ml_model() -> AsyncGenerator[LogisticGAM, None]:
    with MODEL_PATH.open("rb") as f:
        # ruff: ignore[suspicious-pickle-usage]
        return await asyncio.to_thread(pickle.load, f)


@pytest_asyncio.fixture
async def db(engine: AsyncEngine) -> AsyncGenerator[AsyncSession, None]:
    connection: AsyncConnection = await engine.connect()
    transaction = await connection.begin()

    session = AsyncSession(
        bind=connection,
        expire_on_commit=False,
        join_transaction_mode="create_savepoint",
    )
    try:
        yield session
    finally:
        await session.close()
        await transaction.rollback()
        await connection.close()


@pytest_asyncio.fixture
async def cache(redis_client: redis.Redis) -> AsyncGenerator[redis.Redis, None]:
    await redis_client.flushdb()
    await redis_client.set("app:status", "healthy")

    try:
        yield redis_client
    finally:
        await redis_client.flushdb()


@pytest_asyncio.fixture
async def client(
    db: AsyncSession, cache: redis.Redis, ml_model: LogisticGAM
) -> AsyncGenerator[AsyncClient, None]:
    # ruff: ignore[unused-async]
    async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
        yield db

    # ruff: ignore[unused-async]
    async def override_get_redis() -> AsyncGenerator[redis.Redis, None]:
        yield cache

    # ruff: ignore[unused-async]
    async def override_get_model() -> AsyncGenerator[LogisticGAM, None]:
        yield ml_model

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_redis] = override_get_redis
    app.dependency_overrides[get_model] = override_get_model

    transport = ASGITransport(app=app, raise_app_exceptions=True)

    try:
        async with AsyncClient(
            transport=transport, base_url="http://test"
        ) as test_client:
            yield test_client
    finally:
        app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def auth_client(client: AsyncClient) -> AuthClient:
    user: dict[str, str] = await register_user(client)

    return AuthClient(client, user)


@pytest_asyncio.fixture
async def auth_client_seed(
    client: AsyncClient,
    db: AsyncSession,
    cache: redis.Redis,
) -> AuthClient:
    user = await register_user(client)

    authenticated_client = AuthClient(
        client,
        user,
    )

    await seed_data(db)
    await seed_cache(db, cache)

    return authenticated_client


@pytest_asyncio.fixture
async def lifespan() -> AsyncGenerator[None, None]:
    async with LifespanManager(app):
        yield
