import json

import pytest

from exceptions.app_exceptions import DataNotFoundError, InvalidGameLineup
from models.enums import Roles
from models.models import User
from schemas import active_game_schemas
from services import game_helpers
from tests.game_helpers import play_game


def test_eval_lineup_sums_scores():
    game = active_game_schemas.GameList(
        players=[
            active_game_schemas.ReducedGamePlayer(
                id=1, role=Roles.OPENER, score=1.5, igl=False
            ),
            active_game_schemas.ReducedGamePlayer(
                id=2, role=Roles.CLOSER, score=2.0, igl=True
            ),
        ]
    )

    assert game_helpers.eval_lineup(game) == 3.5


async def test_eval_category(cache):
    await cache.set(
        "categories",
        json.dumps(
            {
                "cat_1": 10.0,
                "cat_2": 5.0,
                "cat_3": 2.0,
                "cat_4": 0.0,
                "cat_5": -2.0,
                "cat_6": -5.0,
            }
        ),
    )

    assert (
        await game_helpers.eval_category(cache, 10.0) == active_game_schemas.Cat.cat_1
    )
    assert await game_helpers.eval_category(cache, 5.0) == active_game_schemas.Cat.cat_2
    assert await game_helpers.eval_category(cache, 2.0) == active_game_schemas.Cat.cat_3
    assert await game_helpers.eval_category(cache, 0.0) == active_game_schemas.Cat.cat_4
    assert (
        await game_helpers.eval_category(cache, -2.0) == active_game_schemas.Cat.cat_5
    )
    assert (
        await game_helpers.eval_category(cache, -5.0) == active_game_schemas.Cat.cat_6
    )
    assert (
        await game_helpers.eval_category(cache, -10.0) == active_game_schemas.Cat.cat_7
    )


async def test_eval_category_missing_cache(cache):
    await cache.delete("categories")

    with pytest.raises(DataNotFoundError):
        await game_helpers.eval_category(cache, 1.0)


def test_valid_lineup_true():
    players = [
        active_game_schemas.ReducedGamePlayer(
            id=1, role=Roles.OPENER, score=1.0, igl=False
        ),
        active_game_schemas.ReducedGamePlayer(
            id=2, role=Roles.CLOSER, score=1.0, igl=False
        ),
        active_game_schemas.ReducedGamePlayer(
            id=3, role=Roles.AWPER, score=1.0, igl=False
        ),
        active_game_schemas.ReducedGamePlayer(
            id=4, role=Roles.SUPPORT, score=1.0, igl=False
        ),
        active_game_schemas.ReducedGamePlayer(
            id=5, role=Roles.OPENER, score=1.0, igl=True
        ),
    ]

    game = active_game_schemas.GameList(players=players)

    assert game_helpers.valid_lineup(game) is True


def test_valid_lineup_false_missing_role():
    players = [
        active_game_schemas.ReducedGamePlayer(
            id=1, role=Roles.OPENER, score=1.0, igl=False
        ),
        active_game_schemas.ReducedGamePlayer(
            id=2, role=Roles.CLOSER, score=1.0, igl=False
        ),
        active_game_schemas.ReducedGamePlayer(
            id=3, role=Roles.AWPER, score=1.0, igl=False
        ),
        active_game_schemas.ReducedGamePlayer(
            id=4, role=Roles.OPENER, score=1.0, igl=False
        ),
        active_game_schemas.ReducedGamePlayer(
            id=5, role=Roles.OPENER, score=1.0, igl=True
        ),
    ]

    game = active_game_schemas.GameList(players=players)

    assert game_helpers.valid_lineup(game) is False


async def test_validate_game_success(auth_client_seed, db, cache):
    submission = await play_game(auth_client_seed)

    active_game_json = await cache.get(submission["game_id"])
    assert active_game_json is not None

    active_game = active_game_schemas.ActiveGame.model_validate_json(active_game_json)
    game_result = active_game_schemas.GameResult.model_validate(submission)

    game_list = await game_helpers.validate_game(
        game=game_result,
        active_game=active_game,
        db=db,
    )

    assert len(game_list.players) == 5
    assert any(p.igl for p in game_list.players)


async def test_validate_game_duplicate_player(auth_client_seed, db, cache):
    submission = await play_game(auth_client_seed)
    submission["player_2"] = submission["player_1"]

    active_game_json = await cache.get(submission["game_id"])
    active_game = active_game_schemas.ActiveGame.model_validate_json(active_game_json)
    game_result = active_game_schemas.GameResult.model_validate(submission)

    with pytest.raises(DataNotFoundError):
        await game_helpers.validate_game(
            game=game_result,
            active_game=active_game,
            db=db,
        )


async def test_validate_game_wrong_igl(auth_client_seed, db, cache):
    submission = await play_game(auth_client_seed)
    submission["igl"] = 9999

    active_game_json = await cache.get(submission["game_id"])
    active_game = active_game_schemas.ActiveGame.model_validate_json(active_game_json)
    game_result = active_game_schemas.GameResult.model_validate(submission)

    with pytest.raises(InvalidGameLineup):
        await game_helpers.validate_game(
            game=game_result,
            active_game=active_game,
            db=db,
        )


async def test_evaluation_base_success(auth_client_seed, db, cache):
    submission = await play_game(auth_client_seed)

    await cache.set(
        "categories",
        json.dumps(
            {
                "cat_1": 10.0,
                "cat_2": 5.0,
                "cat_3": 2.0,
                "cat_4": 0.0,
                "cat_5": -2.0,
                "cat_6": -5.0,
            }
        ),
    )

    active_game_json = await cache.get(submission["game_id"])
    active_game = active_game_schemas.ActiveGame.model_validate_json(active_game_json)
    game_result = active_game_schemas.GameResult.model_validate(submission)

    evaluation = await game_helpers.evaluation_base(
        game=game_result,
        active_game=active_game,
        cache=cache,
        db=db,
    )

    assert evaluation.score > 0
    assert evaluation.best is False
    assert await cache.get(submission["game_id"]) is None


async def test_update_user_game_best_score(db):
    user = User(username="scoreuser", best_score=1.0)

    db.add(user)
    await db.commit()
    await db.refresh(user)

    best = await game_helpers.update_user_game(db=db, user=user, score=2.0)

    assert best is True
    await db.refresh(user)
    assert user.best_score == 2.0

    best = await game_helpers.update_user_game(db=db, user=user, score=1.5)

    assert best is False
    await db.refresh(user)
    assert user.best_score == 2.0
