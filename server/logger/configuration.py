import logging


def configure_logging() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format=("%(asctime)s | %(levelname)s | %(name)s | %(message)s"),
    )
    uvicorn_logger = logging.getLogger("uvicorn.error")
    uvicorn_logger.propagate = False
