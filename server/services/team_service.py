import logging

from redis.asyncio import Redis

from exceptions.app_exceptions import DataNotFoundError
from schemas import team_schemas

logger = logging.getLogger(__name__)


async def get(cache: Redis) -> team_schemas.Teams:
    teams = await cache.get("team_ids")
    if not teams:
        raise DataNotFoundError("Teams")

    teams = team_schemas.Teams.model_validate_json(teams)

    if not isinstance(teams, team_schemas.Teams):
        raise DataNotFoundError("Teams")

    logger.info("Successfully returned teams")

    return teams
