import logging

# ruff: ignore[suspicious-pickle-import]
import pickle
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse

# ruff: ignore[import-private-name]
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIASGIMiddleware
from sqlalchemy import text
from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware

from cache.init_cache import initialise_cache
from cache.redis import RedisDep, create_redis
from database.database import DBDep
from database.init_db import initialise_db
from exceptions.app_exceptions import (
    AppException,
    UninstantiatedCache,
)
from exceptions.steam_exceptions import SteamException
from limiter.limiter import limiter
from logger.configuration import configure_logging
from logger.logging_middleware import LoggingMiddleware
from routers import auth, email, game, steam, teams, user
from utils.config import get_settings

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "ml" / "gam.pkl"


@asynccontextmanager
async def lifespan(app: FastAPI):
    configure_logging()

    app.state.redis = create_redis()

    try:
        with MODEL_PATH.open("rb") as f:
            # ruff: ignore[suspicious-pickle-usage]
            app.state.model = pickle.load(f)

        await app.state.redis.ping()

        await initialise_db()
        await initialise_cache(cache=app.state.redis)

        await app.state.redis.set("app:status", "healthy")

        yield
    finally:
        await app.state.redis.aclose()


settings = get_settings()

origins = settings.allowed_origins.split(",")

logger = logging.getLogger(__name__)

app = FastAPI(lifespan=lifespan)
app.state.limiter = limiter
# pyrefly: ignore [bad-argument-type]
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIASGIMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(ProxyHeadersMiddleware, trusted_hosts=["172.16.0.0/12"])

app.add_middleware(LoggingMiddleware)

app.include_router(user.router)
app.include_router(teams.router)
app.include_router(game.router)
app.include_router(steam.router)
app.include_router(email.router)
app.include_router(auth.router)


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


@app.exception_handler(SteamException)
def steam_exception_handler(
    request: Request,
    exc: SteamException,
) -> RedirectResponse:
    logger.warning(f"SteamException raised: {exc.__class__.__name__}: {exc.message}")
    return RedirectResponse(url=settings.frontend_auth_url, status_code=exc.status_code)


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
