import logging

from fastapi import Depends, FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from database.database import get_db
from exceptions.app_exceptions import AppException
from logger.configuration import configure_logging
from logger.logging_middleware import LoggingMiddleware
from routers import game, teams, user
from utils.config import settings

origins = settings.allowed_origins.split(",")

configure_logging()

logger = logging.getLogger(__name__)

app = FastAPI()

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
async def health(db: AsyncSession = Depends(get_db)) -> dict[str, str]:
    try:
        await db.execute(text("SELECT 1"))
    except Exception:
        logger.exception("DB is not healthy")
        return {"status": "unhealthy"}
    else:
        return {"status": "healthy"}
