from sqlalchemy.ext.asyncio import AsyncSession

from schemas import lineup_schemas


def valid_lineup(lineup: lineup_schemas.Lineup) -> bool:
    """Will validate the lineup fits the rules
    and that the players exist on db and have the correct scores"""
    print(lineup)
    return True


def eval_lineup(lineup: lineup_schemas.Lineup) -> float:
    score = 0.0
    if not valid_lineup(lineup):
        return -1.0
    for p in lineup.players:
        score += p.hltv
        if p.igl: # This doesn't exist yet, so fix. Create new lineup player schema.
            score += p.igl_bonus
    return score


def persist_lineup(lineup: lineup_schemas.Lineup, db: AsyncSession) -> None:
    """Commit Game to DB connected to user, requires updating both user and game
    investigate relationships under data change."""
    print(lineup)
    print(db)
    pass


def evaluation(score, best) -> lineup_schemas.LineupEvaluation:
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
