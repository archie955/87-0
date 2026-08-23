from pathlib import Path

import numpy as np
import polars as pl
from sqlalchemy import select

from database.database import AsyncSessionLocal
from models import models
from models.enums import Roles

"""
IGL Bonus is calculated as:
"""

DATA_DIR = Path(__file__).parent


async def process_players():
    players = pl.read_csv(DATA_DIR / "players.csv")  # contains all igl data too

    players = players.with_columns(pl.col("role").replace("Opener", Roles.OPENER))
    players = players.with_columns(pl.col("role").replace("Closer", Roles.CLOSER))
    players = players.with_columns(pl.col("role").replace("AWPer", Roles.AWPER))
    players = players.with_columns(pl.col("role").replace("Support", Roles.SUPPORT))

    players = players.with_columns(
        (
            (
                (
                    4 * pl.col("wins")
                    + 3 * pl.col("second")
                    + 2 * pl.col("semi")
                    + pl.col("quarter")
                )
                / np.sqrt(pl.col("total_tournaments"))
            )
            + (np.sqrt(pl.col("win_teammates")) / 10)
        ).alias("igl_bonus")
    )

    players = players.to_pandas()

    async with AsyncSessionLocal() as db:
        teams = (await db.execute(select(models.Team))).scalars().all()
        team_map = {}
        for t in teams:
            team_map[t.name] = t.id

        players["team_id"] = team_map[players["team"]]

        unmatched = players.filter(pl.col("team_id").is_null())

        if len(unmatched) > 0:
            print(unmatched)
            raise ValueError("Some players lack team id")

        players = players.drop(columns=["team"])

        players = players.to_dict(orient="records")
        filtered_data = [
            {
                "name": row.get("name"),
                "team_id": row.get("team_id"),
                "role": row.get("role"),
                "hltv": row.get("hltv"),
                "igl_bonus": row.get("igl_bonus"),
                "major_wins": row.get("major_wins"),
                "win": row.get("first"),
                "second": row.get("second"),
                "semi": row.get("semi"),
                "quarter": row.get("quarter"),
                "no_major_teammates": row.get("no_major_teammates"),
                "no_teammates": row.get("no_teammates"),
                "no_events": row.get("no_events"),
            }
            for row in players
        ]

        for item in filtered_data:
            db.add(models.Player(**item))

        await db.commit()
    return {"status": "success"}
