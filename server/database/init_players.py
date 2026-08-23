import asyncio
from pathlib import Path

import numpy as np
import pandas as pd
from sqlalchemy import select

from database.database import AsyncSessionLocal
from models import models
from models.enums import Roles

"""
IGL Bonus is calculated as:
"""

DATA_DIR = Path(__file__).parent


async def process_players():
    players = pd.read_csv(DATA_DIR / "players.csv")  # contains all igl data too

    players["role"] = players["role"].replace(
        {
            "Opener": Roles.OPENER,
            "Closer": Roles.CLOSER,
            "AWPer": Roles.AWPER,
            "Support": Roles.SUPPORT,
        }
    )

    players["igl_bonus"] = np.where(
        players["no_events"] > 0,
        (
            (
                (
                    8 * players["win"]
                    + 4 * players["second"]
                    + 2 * players["semi"]
                    + players["quarter"]
                )
                / (750 * np.log(players["no_events"]))
            )
            + (np.sqrt(players["no_teammates"]) / 7.5)
            + (np.sqrt(players["no_major_teammates"]) / 90)
        )
        / 1.3,
        0.0,
    )

    async with AsyncSessionLocal() as db:
        teams = (await db.execute(select(models.Team))).scalars().all()

        team_map = {team.name: team.id for team in teams}

        players["team_id"] = players["team"].map(team_map)

        unmatched = players.loc[players["team_id"].isna(), "team"].unique()

        if len(unmatched) > 0:
            print(f"unmatched teams: {unmatched}")
            raise ValueError("Some players lack team id")

        players = players.drop(columns=["team"])

        players = players.rename(
            columns={
                "major_wins": "majors",
                "win": "wins",
                "no_major_teammates": "major_teammates",
                "no_teammates": "win_teammates",
                "no_events": "total_tournaments",
            }
        )

        players = players.to_dict(orient="records")

        for player in players:
            db.add(models.Player(**player))

        await db.commit()
    return {"status": "success"}


def main():
    asyncio.run(process_players())


if __name__ == "__main__":
    main()
