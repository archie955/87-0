import json
import logging
from random import randint

from redis.asyncio import Redis

from exceptions.app_exceptions import DataNotFoundError
from schemas import team_schemas

logger = logging.getLogger(__name__)


async def get(redis: Redis) -> team_schemas.Teams:
    team_ids_string = await redis.get("team_ids")
    if not team_ids_string:
        raise DataNotFoundError(datatype="Team ids")
    team_ids: list[int] = json.loads(team_ids_string)
    n = len(team_ids)
    data = {}
    for i in range(1, 7):
        temp = await redis.get(str(team_ids[randint(0, n - 1)]))
        if not temp:
            raise DataNotFoundError(datatype="Team")
        data[f"team_{i}"] = json.loads(temp)

    teams = team_schemas.Teams.model_validate(data)

    logger.info("Successfully generated teams", extra={"teams": teams})

    return teams
