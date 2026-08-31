# pyrefly: ignore-errors [bad-argument-type]

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from exceptions.app_exceptions import (
    BadRequestError,
    DataNotFoundError,
    InvalidGameLineup,
)
from models.enums import Roles
from models.models import Player
from schemas import active_game_schemas

MAX_DOUBLE_PLAYER = 2
TEAM_SIZE = 5


def eval_lineup(game: active_game_schemas.GameList) -> float:
    score = 0.0

    for p in game.players:
        score += p.score
    return score


async def validate_game(
    game: active_game_schemas.GameResult,
    active_game: active_game_schemas.ActiveGame,
    db: AsyncSession,
) -> active_game_schemas.GameList:
    """Validates the game exists, is live, and the players were selected
    from the generated teams in the correct order.

    Explicitly, this checks that the 5 players exist in the database first. Then,
    It checks that the players are selected from the teams generated in the order
    generated. It then checks that there is one and only one igl listed."""
    ids = [
        game.player_1.id,
        game.player_2.id,
        game.player_3.id,
        game.player_4.id,
        game.player_5.id,
    ]

    players = (
        (await db.execute(select(Player).filter(Player.id.in_(ids)))).scalars().all()
    )

    if not players or len(players) != TEAM_SIZE:
        raise DataNotFoundError(datatype="players")

    teams = [p.team_id for p in players]

    team_ids = [
        active_game.team_1_id,
        active_game.team_2_id,
        active_game.team_3_id,
        active_game.team_4_id,
        active_game.team_5_id,
        active_game.team_6_id,
    ]

    team_set = set(teams)

    skip = False
    for id in team_set:
        tc = teams.count(id)
        tic = team_ids.count(id)
        if tc != tic:
            if tc != tic - 1 or skip:
                raise InvalidGameLineup(
                    id=id,
                    reason=f"Wrong team, game_ids={team_ids},"
                    f"player_teams={[(p.name, p.team_id) for p in players]}",
                )
            skip = True

    if game.igl not in ids:
        raise InvalidGameLineup(id=game.igl, reason="igl")

    player_schema: list[active_game_schemas.ReducedGamePlayer] = []

    for p in players:
        igl = game.igl == p.id
        score = p.hltv + p.igl_bonus if igl else p.hltv
        ps = active_game_schemas.ReducedGamePlayer(
            id=p.id,
            role=p.role,
            score=score,
            igl=igl,
        )
        player_schema.append(ps)

    return active_game_schemas.GameList(players=player_schema)


def valid_lineup(game: active_game_schemas.GameList) -> bool:
    """Validates the player roles"""
    freq: dict[Roles, int] = {
        Roles.OPENER: 0,
        Roles.CLOSER: 0,
        Roles.AWPER: 0,
        Roles.SUPPORT: 0,
    }
    keys = freq.keys()

    for p in game.players:
        if p.role not in keys:
            return False
        freq[p.role] += 1

    double_key = False
    for key in keys:
        if freq[key] == MAX_DOUBLE_PLAYER and not double_key:
            double_key = True
        elif freq[key] != 1:
            return False

    return double_key


async def evaluation_base(
    game: active_game_schemas.GameResult,
    active_game: active_game_schemas.ActiveGame,
    db: AsyncSession,
) -> active_game_schemas.GameEvaluation:
    game_list = await validate_game(game=game, active_game=active_game, db=db)

    if not valid_lineup(game=game_list):
        raise BadRequestError(message="Invalid Game")

    score = eval_lineup(game_list)

    return active_game_schemas.GameEvaluation(score=score, best=False)
