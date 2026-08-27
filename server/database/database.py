from collections.abc import AsyncGenerator
from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import declarative_base

from utils.config import get_settings

settings = get_settings()

SQLALCHEMY_DATABASE_URL = f"postgresql+psycopg://{settings.postgres_username}:{settings.postgres_password}@{settings.postgres_hostname}/{settings.postgres_name}"

Base = declarative_base()
engine = create_async_engine(SQLALCHEMY_DATABASE_URL, echo=True)
AsyncSessionLocal = async_sessionmaker(bind=engine, expire_on_commit=False)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    db = AsyncSessionLocal()
    try:
        yield db
    except Exception:
        await db.rollback()
        raise
    finally:
        await db.close()


DBDep = Annotated[AsyncSession, Depends(get_db)]
