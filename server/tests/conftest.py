from collections.abc import AsyncGenerator

import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from database.database import get_db
from main import app
from models.models import Base
from tests.authclient import AuthClient
from tests.helpers import Helpers

SQLALCHEMY_DATABASE_URL = (
    "postgresql+psycopg://postgres:postgres@localhost:5433/test_db"
)


@pytest_asyncio.fixture(scope="function")
async def engine() -> AsyncGenerator[AsyncEngine, None]:
    engine = create_async_engine(SQLALCHEMY_DATABASE_URL)

    async with engine.begin() as conn:
        await conn.run_sync(fn=Base.metadata.create_all)

    yield engine

    async with engine.begin() as conn:
        await conn.run_sync(fn=Base.metadata.drop_all)

    await engine.dispose()


@pytest_asyncio.fixture(scope="function")
async def db(engine: AsyncEngine) -> AsyncGenerator[AsyncSession, None]:
    SessionLocal: async_sessionmaker[AsyncSession] = async_sessionmaker(
        bind=engine, class_=AsyncSession, expire_on_commit=False
    )

    async with SessionLocal() as session:
        yield session
        await session.rollback()


@pytest_asyncio.fixture(scope="function")
async def client(db: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
        yield db

    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app, raise_app_exceptions=True)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client

    app.dependency_overrides.clear()


@pytest_asyncio.fixture
def helpers() -> Helpers:
    return Helpers()


@pytest_asyncio.fixture
async def auth_client(
    client: AsyncClient, db: AsyncSession, helpers: Helpers
) -> AuthClient:
    user: dict[str, str] = await helpers.full_login(client)

    return AuthClient(client, user, db=db)
