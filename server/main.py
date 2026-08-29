import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text

from cache.init_cache import initialise_db_and_cache
from cache.redis import RedisDep, create_redis
from database.database import AsyncSessionLocal, DBDep, engine
from exceptions.app_exceptions import AppException, UninstantiatedCache
from logger.configuration import configure_logging
from logger.logging_middleware import LoggingMiddleware
from models.models import Base
from routers import email, game, steam, teams, user
from utils.config import get_settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    configure_logging()

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    app.state.redis = create_redis()

    try:
        await app.state.redis.ping()
        await app.state.redis.set("app:status", "healthy")

        async with AsyncSessionLocal() as db:
            await initialise_db_and_cache(db=db, cache=app.state.redis)
        yield
    finally:
        await app.state.redis.aclose()


settings = get_settings()

origins = settings.allowed_origins.split(",")

logger = logging.getLogger(__name__)

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(LoggingMiddleware)

app.include_router(user.router)
app.include_router(teams.router)
app.include_router(game.router)
app.include_router(steam.router)
app.include_router(email.router)


@app.exception_handler(AppException)
def app_exception_handler(
    request: Request,
    exc: AppException,
) -> JSONResponse:
    logger.warning(f"AppException raised: {exc.__class__.__name__}: {exc.message}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.message},
        headers=exc.headers,
    )


@app.exception_handler(RequestValidationError)
def validation_exception_handler(
    request: Request,
    exc: RequestValidationError,
):
    logger.error("REQUEST VALIDATION ERROR: %s", exc.errors())

    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()},
    )


@app.exception_handler(Exception)
def global_expression_handler(request: Request, exc: Exception):
    logger.error(
        f"Unhandled exception: {exc} | {request.method} {request.url} from "
        f"{request.client.host if request.client else 'HOST NOT FOUND'}"
    )

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error"},
    )


@app.get("/health")
async def health(request: Request, db: DBDep, cache: RedisDep) -> dict[str, str]:
    try:
        await db.execute(text("SELECT 1"))
    except Exception:
        logger.exception("DB is not healthy")
        return {"status": "unhealthy"}
    else:
        status = {"status": "healthy"}
    try:
        redis_state = await cache.get("app:status")
    except Exception:
        logger.exception("Redis Cache is not healthy")
        return {"status": "unhealthy"}
    if redis_state != "healthy":
        raise UninstantiatedCache()
    return status
