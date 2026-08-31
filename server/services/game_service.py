import json
import uuid
from random import randint

import redis.asyncio as redis
from sqlalchemy.ext.asyncio import AsyncSession

from exceptions.app_exceptions import DataNotFoundError
from models.models import User
from schemas import active_game_schemas
from services import game_helpers

MIN_TEAMS = 2


async def create_game(cache: redis.Redis) -> active_game_schemas.ActiveGame:
    teams = await cache.get("team_ids")

    if not teams:
        raise DataNotFoundError(datatype="Teams")

    teams = json.loads(teams)

    if not isinstance(teams, list) and not all(isinstance(t, int) for t in teams):
        raise DataNotFoundError(datatype="Teams")

    if len(teams) < MIN_TEAMS:
        raise DataNotFoundError(datatype="Teams")

    n = len(teams)

    active_game = {}
    for i in range(1, 7):
        # ruff: ignore[suspicious-non-cryptographic-random-usage]
        active_game[f"team_{i}_id"] = teams[randint(0, n - 1)]

    id = str(uuid.uuid4())
    active_game["id"] = id

    active_game = active_game_schemas.ActiveGame.model_validate(active_game)

    await cache.set(id, active_game.model_dump_json(), ex=15 * 60)

    return active_game


async def game_evaluation(
    game: active_game_schemas.GameResult,
    active_game: active_game_schemas.ActiveGame,
    user: User | None,
    db: AsyncSession,
    cache: redis.Redis,
) -> active_game_schemas.GameEvaluation:
    game_evaluation = await game_helpers.evaluation_base(
        game=game, active_game=active_game, db=db
    )

    if user:
        best = await game_helpers.update_user_game(
            db=db,
            user=user,
            score=game_evaluation.score,
            cache=cache,
            id=active_game.id,
        )
        game_evaluation.best = best

    return game_evaluation
