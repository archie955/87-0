import logging

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from exceptions.app_exceptions import DataNotFoundError
from models.models import Team
from schemas import player_schemas, team_schemas

logger = logging.getLogger(__name__)


async def get(db: AsyncSession) -> team_schemas.Teams:
    teams = (
        (await db.execute(select(Team).options(selectinload(Team.players))))
        .scalars()
        .all()
    )

    if not teams:
        raise DataNotFoundError(datatype="Teams")

    team_list = []

    for t in teams:
        team_players = []
        for p in t.players:
            team_players.append(player_schemas.Player.model_validate(p))
        players = player_schemas.Team_Players(players=team_players)
        team = team_schemas.Team(id=t.id, name=t.name, players=players)
        team_list.append(team)

    team_return = team_schemas.Teams(teams=team_list)

    logger.info("Successfully generated teams", extra={"no_of_teams": len(teams)})

    return team_return
