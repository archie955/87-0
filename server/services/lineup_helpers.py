from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.enums import Roles
from models.models import Game, Player, User
from schemas import lineup_schemas
from services.helpers import safe_commit


async def valid_lineup(lineup: lineup_schemas.Lineup, db: AsyncSession) -> bool:
    """Validates the player lineup"""
    if len(lineup.players) != 5:
        return False

    freq = {Roles.OPENER: 0, Roles.CLOSER: 0, Roles.AWPER: 0, Roles.SUPPORT: 0}
    keys = freq.keys()

    igl = False

    ids = []

    for p in lineup.players:
        ids.append(p.id)
        if p.role not in keys:
            return False
        else:
            freq[p.role] += 1
        if p.igl and not igl:
            igl = True
        elif p.igl and igl:
            return False

    db_players = (
        (await db.execute(select(Player).filter(Player.id.in_(ids)))).scalars().all()
    )

    if len(db_players) != 5:
        return False

    double_key = False
    for key in keys:
        if freq[key] == 2 and not double_key:
            double_key = True
        elif freq[key] != 1:
            return False
    return double_key and igl


def eval_lineup(lineup: lineup_schemas.Lineup) -> float:
    score = 0.0
    for p in lineup.players:
        score += p.hltv
        if p.igl:
            score += p.igl_bonus
    return score


async def update_lineup(
    lineup: lineup_schemas.Lineup, score: float, user: User, db: AsyncSession
) -> None:
    game = user.best_game
    keys = set()

    for p in lineup.players:
        key = f"{str(p.role).lower()}_id"

        if key in keys:
            game.flex_id = p.id

        else:
            keys.add(key)
            game[key] = p.id

        if p.igl:
            game.igl_id = p.id
    game.score = score

    await safe_commit(db=db, datatype="Game")
    return


async def create_lineup(
    lineup: lineup_schemas.Lineup, score: float, user: User, db: AsyncSession
) -> None:
    game_dict = {}
    game_dict["user_id"] = user.id

    for p in lineup.players:
        key = f"{str(p.role).lower()}_id"

        if key in game_dict:
            game_dict["flex_id"] = p.id

        else:
            game_dict[key] = p.id

        if p.igl:
            game_dict["igl_id"] = p.id

    game_dict["score"] = score

    game = Game(**game_dict)
    db.add(game)

    await safe_commit(db=db, datatype="Game")
    return


def evaluation_user(score: float, best: bool) -> lineup_schemas.LineupEvaluation:
    """bracket will just determine which group it is,
    higher bracket means higher score"""
    if score < 5.0:
        bracket = 0
    elif score < 6.0:
        bracket = 1
    else:
        bracket = 2
    response = lineup_schemas.LineupEvaluation(score=score, bracket=bracket, best=best)
    return response


def evaluation_no_user(score: float) -> lineup_schemas.LineupEvaluationNoUser:
    if score < 5.0:
        bracket = 0
    elif score < 6.0:
        bracket = 1
    else:
        bracket = 2
    response = lineup_schemas.LineupEvaluationNoUser(score=score, bracket=bracket)
    return response
