import uuid
import logging
import time
from collections.abc import Awaitable, Callable
from typing import override

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)


class LoggingMiddleware(BaseHTTPMiddleware):
    @override
    @staticmethod
    async def dispatch(
        request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        id = str(uuid.uuid4())
        method = request.method
        url = request.url.path
        client_ip = request.client.host if request.client else "NO HOST"

        logger.info(
            "%s %s [%s] from %s",
            method,
            url,
            id,
            client_ip,
        )

        start = time.perf_counter()

        response = await call_next(request)

        duration = time.perf_counter() - start

        logger.info("%s %s [%s] -> %s (%.3fs)", method, url, id, response.status_code, duration)

        return response
