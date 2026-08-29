import json
import logging

from redis.asyncio import Redis

from exceptions.app_exceptions import DataNotFoundError
from schemas import player_schemas, team_schemas

logger = logging.getLogger(__name__)


async def get(cache: Redis) -> team_schemas.Teams:
    team_ids = await cache.get("team_ids")
    if not team_ids:
        raise DataNotFoundError("Teams")

    team_ids = json.loads(team_ids)

    if not isinstance(team_ids, list) and not isinstance(team_ids[0], int):
        raise DataNotFoundError("Teams")

    async with cache.pipeline(transaction=False) as pipe:
        team_list = []
        for id in team_ids:
            pipe.get(f"team:{id}")
        team_list = await pipe.execute()

    team_dict = {}
    for t in team_list:
        team = json.loads(t)
        team_players = [player_schemas.Player.model_validate(p) for p in team.players]
        team = team_schemas.Team(id=team.id, name=team.name, players=team_players)
        team_dict[team.id] = team

    team_return = team_schemas.Teams.model_validate(team_dict)

    logger.info("Successfully generated teams", extra={"no_of_teams": len(team_list)})

    return team_return
