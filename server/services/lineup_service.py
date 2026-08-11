from sqlalchemy.ext.asyncio import AsyncSession

from exceptions.app_exceptions import BadRequestError
from models.models import User
from schemas import lineup_schemas
from services import lineup_helpers


async def eval_user(lineup: lineup_schemas.Lineup, user: User, db: AsyncSession):

    valid = await lineup_helpers.valid_lineup(lineup=lineup, db=db)
    if valid:
        raise BadRequestError(message="Invalid Lineup")

    score = lineup_helpers.eval_lineup(lineup)
    best = False

    if user.best_game is None:
        best = True
        await lineup_helpers.create_lineup(lineup, score, user, db)

    elif user.best_game.score <= score:
        best = True
        await lineup_helpers.update_lineup(lineup, score, user, db)

    res = lineup_helpers.evaluation_user(score=score, best=best)
    return res


async def eval_no_user(lineup: lineup_schemas.Lineup, db: AsyncSession):

    valid = await lineup_helpers.valid_lineup(lineup=lineup, db=db)
    if not valid:
        raise BadRequestError(message="Invalid Lineup")

    score = lineup_helpers.eval_lineup(lineup)

    res = lineup_helpers.evaluation_no_user(score)
    return res
