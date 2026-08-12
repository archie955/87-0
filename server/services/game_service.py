from random import randint

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from exceptions.app_exceptions import BadRequestError, DataNotFoundError
from models.models import Active_Game, Team, User
from schemas import active_game_schemas
from services import game_helpers
from services.helpers import safe_commit


async def create_game(db: AsyncSession) -> active_game_schemas.Game:
    teams = (await db.execute(select(Team))).scalars().all()

    if not teams or len(teams) < 2:
        raise DataNotFoundError(datatype="Teams")

    n = len(teams)

    ids = {}
    for i in range(1, 7):
        ids[f"team_{i}_id"] = teams[randint(0, n - 1)].id

    active_game = Active_Game(**ids)

    db.add(active_game)
    await safe_commit(db, datatype="Active Game")

    await db.refresh(active_game)

    return active_game_schemas.Game.model_validate(active_game)


async def evaluate_user_game(
    game: active_game_schemas.GameResult,
    active_game: Active_Game,
    user: User,
    db: AsyncSession,
) -> active_game_schemas.GameEvaluationUser:
    game_list = await game_helpers.validate_game(
        game=game, active_game=active_game, db=db
    )

    if not game_helpers.valid_lineup(game=game_list):
        raise BadRequestError(message="Invalid Game")

    await db.delete(active_game)
    await db.commit()

    score = game_helpers.eval_lineup(game_list)
    best = False

    if user.best_game is None:
        best = True
        await game_helpers.create_lineup(game_list, score, user, db)

    elif user.best_game.score <= score:
        best = True
        await game_helpers.update_lineup(game_list, score, user, db)

    res = game_helpers.evaluation_user(score=score, best=best)
    return res


async def evaluate_game(
    game: active_game_schemas.GameResult, active_game: Active_Game, db: AsyncSession
) -> active_game_schemas.GameEvaluation:
    game_list = await game_helpers.validate_game(
        game=game, active_game=active_game, db=db
    )

    if not game_helpers.valid_lineup(game=game_list):
        raise BadRequestError(message="Invalid Game")

    await db.delete(active_game)
    await db.commit()

    score = game_helpers.eval_lineup(game_list)

    res = game_helpers.evaluation_no_user(score)
    return res
