from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from exceptions.app_exceptions import (
    DataNotFoundError,
    InvalidGameLineup,
)
from models.enums import Roles
from models.models import Active_Game, Player
from schemas import active_game_schemas


def eval_lineup(game: active_game_schemas.GameList) -> float:
    score = 0.0

    for p in game.players:
        score += p.score
    return score


async def validate_game(
    game: active_game_schemas.GameResult, active_game: Active_Game, db: AsyncSession
) -> active_game_schemas.GameList:
    """Validates the game exists, is live, and the players were selected
    from the generated teams in the correct order.

    Explicitly, this checks that the 5 players exist in the database first. Then,
    It checks that the players are selected from the teams generated in the order
    generated. It then checks that there is one and only one igl listed."""
    player_1 = (
        await db.execute(select(Player).filter(Player.id == game.player_1.id))
    ).scalar_one_or_none()

    player_2 = (
        await db.execute(select(Player).filter(Player.id == game.player_2.id))
    ).scalar_one_or_none()

    player_3 = (
        await db.execute(select(Player).filter(Player.id == game.player_3.id))
    ).scalar_one_or_none()

    player_4 = (
        await db.execute(select(Player).filter(Player.id == game.player_4.id))
    ).scalar_one_or_none()

    player_5 = (
        await db.execute(select(Player).filter(Player.id == game.player_5.id))
    ).scalar_one_or_none()

    if not (player_1 and player_2 and player_3 and player_4 and player_5):
        raise DataNotFoundError(datatype="Players")

    skip = False
    if player_1.team_id != active_game.team_1_id and not (
        skip and player_1.team_id == active_game.team_2_id
    ):
        raise InvalidGameLineup(id=1, reason="wrong team")

    if player_2.team_id != active_game.team_2_id and not (
        skip and player_2.team_id == active_game.team_3_id
    ):
        raise InvalidGameLineup(id=2, reason="wrong team")

    if player_3.team_id != active_game.team_3_id and not (
        skip and player_3.team_id == active_game.team_4_id
    ):
        raise InvalidGameLineup(id=3, reason="wrong team")

    if player_4.team_id != active_game.team_4_id and not (
        skip and player_4.team_id == active_game.team_5_id
    ):
        raise InvalidGameLineup(id=4, reason="wrong team")

    if player_5.team_id != active_game.team_5_id and not (
        skip and player_5.team_id == active_game.team_6_id
    ):
        raise InvalidGameLineup(id=5, reason="wrong team")

    ids = {player_1.id, player_2.id, player_3.id, player_4.id, player_5.id}

    if game.igl not in ids:
        raise InvalidGameLineup(id=game.igl, reason="igl")

    players = [player_1, player_2, player_3, player_4, player_5]
    player_schema = []

    for p in players:
        igl = game.igl == p.id
        score = p.hltv + p.igl_bonus if igl else p.hltv
        ps = active_game_schemas.ReducedGamePlayer(
            id=p.id, role=p.role, score=score, igl=igl
        )
        player_schema.append(ps)

    return active_game_schemas.GameList(players=player_schema)


def valid_lineup(game: active_game_schemas.GameList) -> bool:
    """Validates the player roles"""
    freq = {Roles.OPENER: 0, Roles.CLOSER: 0, Roles.AWPER: 0, Roles.SUPPORT: 0}
    keys = freq.keys()

    for p in game.players:
        if p.role not in keys:
            return False
        else:
            freq[p.role] += 1

    double_key = False
    for key in keys:
        if freq[key] == 2 and not double_key:
            double_key = True
        elif freq[key] != 1:
            return False

    return double_key


"""
async def update_lineup(
    game: active_game_schemas.GameList, score: float, user: User, db: AsyncSession
) -> None:
    best_game = user.best_game
    keys = set()

    for p in game.players:
        key = f"{str(p.role).lower()}_id"

        if key in keys:
            best_game.flex_id = p.id

        else:
            keys.add(key)
            best_game[key] = p.id

        if p.igl:
            best_game.igl_id = p.id
    best_game.score = score

    await safe_commit(db=db, datatype="Game")
    return


async def create_lineup(
    game: active_game_schemas.GameList, score: float, user: User, db: AsyncSession
) -> None:
    game_dict = {}

    for p in game.players:
        key = f"{str(p.role).lower()}_id"

        if key in game_dict:
            game_dict["flex_id"] = p.id

        else:
            game_dict[key] = p.id

        if p.igl:
            game_dict["igl_id"] = p.id

    game_dict["score"] = score

    best_game = Game(**game_dict, owner=user)
    db.add(best_game)

    await safe_commit(db=db, datatype="Game")
    return
"""
