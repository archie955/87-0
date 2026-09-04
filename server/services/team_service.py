"""Service functions for team routers contained in routers/team.py.

Contains a single function, get(cache: Redis) -> team_schemas.Teams, that takes in
an instance of the async redis cache, and returns all the teams with the players
from it.

Typical usage example:

    teams = await get(cache)
"""

import logging

from redis.asyncio import Redis

from exceptions.app_exceptions import DataNotFoundError
from schemas import team_schemas

logger = logging.getLogger(__name__)


async def get(cache: Redis) -> team_schemas.Teams:
    """Fetches teams from async redis cache. Converts them into an instance of the
    team_schemas.Teams pydantic model. Validates the existence of the teams,
    and returns them.

    Args:
        cache: An instance of an async redis cache

    Returns:
        Teams: A pydantic root model containing integer keys corresponding to
        Team models. The Team model contains an integer id, string name,
        and list of Player models. The Player model contains an integer id,
        string name, integer team id, custom enum Roles role, float hltv score,
        and finally float igl bonus. For example:

        {1:
            {
                "id": 1,
                "name": "Falcons",
                "players": [
                    {
                        "id": 1,
                        "name": karrigan,
                        "team_id": 1,
                        "role": Roles.OPENER,
                        "hltv": 0.80,
                        "igl_bonus": 0.53
                    },
                    ...
                ]
            }
        }

    Raises:
        DataNotFoundError: Data not found
    """
    teams = await cache.get("teams")
    if not teams:
        raise DataNotFoundError("Teams")

    teams = team_schemas.Teams.model_validate_json(teams)

    if not teams:
        raise DataNotFoundError("Teams")

    logger.info("Successfully returned teams")

    return teams
