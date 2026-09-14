from typing import TypedDict
import asyncio
from pathlib import Path

from sqlalchemy import select

from database.database import AsyncSessionLocal
from models import models
from models.enums import Roles

"""
IGL Bonus is calculated as:
"""

DATA_DIR = Path(__file__).parent
ML_DIR = DATA_DIR.parent / "ml/gam.pkl"

async def process_players(persist: bool) -> dict[str, float]:
    # lazy import numpy and pandas so they only import into lifespan if needed
    import numpy as np
    import pandas as pd
    import pickle

    with ML_DIR.open("rb") as f:
        gam = pickle.load(f)
    
    df = pd.read_csv(DATA_DIR / "players.csv")  # contains all igl data too

    df["role"] = df["role"].replace(
        {
            "Opener": Roles.OPENER,
            "Closer": Roles.CLOSER,
            "AWPer": Roles.AWPER,
            "Support": Roles.SUPPORT,
        }
    )

    df["events_bonus"] = df["no_events"]**(0.1) / 15
    df["perf_bonus"] = (8*df["win"] + 4*df["second"] + 2*df["semi"] + df["quarter"])/(12*df["no_events"]**0.5)
    df["team_bonus"] = 0.5*np.sqrt(df["no_teammates"])
    df["p"] = gam.predict_proba(df[["hltv"]])

    df["igl_bonus"] = df["events_bonus"] + (df["perf_bonus"] + df["team_bonus"]) / (15*df["p"]**0.5)
    df = df.fillna(0)

    df["igl_score"] = 0.8*df["hltv"] + df["igl_bonus"]

    df["odds"] = np.log(df["p"] / (1-df["p"]))
    df["p_igl"] = gam.predict_proba(df[["igl_score"]])
    df["igl_odds"] = np.log(df["p_igl"] / (1-df["p_igl"]))

    avg_score = df[df["no_events"] == 0]["odds"].mean()
    avg_igl = df[df["no_events"] > 0]["igl_odds"].mean()

    team_avg_score = 4*avg_score + avg_igl

    df["odds"] = df["odds"] - (team_avg_score/5)
    df["igl_odds"] = df["igl_odds"] - (team_avg_score/5)

    scores: list[tuple[str, np.float64]] = []
    teams = df["team"].unique()
    for team in teams:
        players = df[df["team"] == team][["name", "odds", "igl_odds", "no_events"]].sort_values(by="no_events", ascending=False)
        igl = players.iloc[0]
        score = players[players["name"] != igl["name"]]["odds"].sum() + igl["igl_odds"]
        scores.append((team, score))

    def score_key(x: tuple[str, np.float64]) -> np.float64:
        return x[1]
        
    scores.sort(key=score_key, reverse=True)

    best_igl = df.sort_values("igl_odds", ascending=False).iloc[0]
    best_opener = df[df["role"] == Roles.OPENER].sort_values("odds", ascending=False).iloc[0]
    best_closer = df[df["role"] == Roles.CLOSER].sort_values("odds", ascending=False).iloc[0]
    best_awper = df[df["role"] == Roles.AWPER].sort_values("odds", ascending=False).iloc[0]
    best_support = df[df["role"] == Roles.SUPPORT].sort_values("odds", ascending=False).iloc[0]

    best_score = best_igl["igl_odds"] + best_opener["odds"] + best_closer["odds"] + best_awper["odds"] + best_support["odds"]
    factor = 10/best_score

    df["odds"] = df["odds"]*factor
    df["igl_odds"] = df["igl_odds"]*factor

    cat_1 = factor*(best_score + scores[0][1]) / 2 # GOAT
    cat_2 = factor*(max(scores[0][1] + scores[2][1], scores[1][1])) / 2 # not if, but how many majors
    cat_3 = factor*(max(scores[2][1] + scores[4][1], scores[3][1])) / 2 # wins and major hopefuls
    cat_4 = factor*(max(scores[4][1] + scores[9][1], scores[7][1])) / 2 # win sometimes, major knockouts
    cat_5 = factor*(max(scores[9][1] + scores[17][1], scores[15][1])) / 2 # no win, knockout hopefuls, maybe young prospects or maybe just a new player or two
    cat_6 = factor*(max(scores[17][1] + scores[25][1], scores[23][1])) / 2 # tier 2, but tier 1 hopefuls. 
    # cat_7 is tier 2 at best, not much hope
    
    if persist:
        async with AsyncSessionLocal() as db:
            teams = (await db.execute(select(models.Team))).scalars().all()

            team_map = {team.name: team.id for team in teams}

            df["team_id"] = df["team"].map(team_map)

            unmatched = df.loc[df["team_id"].isna(), "team"].unique()

            if len(unmatched) > 0:
                print(f"unmatched teams: {unmatched}")
                raise ValueError("Some players lack team id")

            df = df.drop(
                columns=[
                    "team",
                    "p",
                    "p_igl",
                    "events_bonus",
                    "perf_bonus",
                    "igl_bonus",
                    "team_bonus"
                ]
            )

            df = df.rename(
                columns={
                    "major_wins": "majors",
                    "win": "wins",
                    "no_major_teammates": "major_teammates",
                    "no_teammates": "win_teammates",
                    "no_events": "total_tournaments",
                }
            )

            df = df.to_dict(orient="records")
            for player in df:
                db.add(models.Player(**player))

            await db.commit()

    response = {"cat_1": cat_1, "cat_2": cat_2, "cat_3": cat_3, "cat_4": cat_4, "cat_5": cat_5, "cat_6": cat_6}
    return response

