from pathlib import Path

import numpy as np
import polars as pl

from models.enums import Roles

"""
IGL Bonus is calculated as:
"""

DATA_DIR = Path(__file__).parent


def process_players(team_map: dict[str, int]):
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

    players = players.with_columns(pl.col("team").replace(team_map).alias("team_id"))

    unmatched = players.filter(pl.col("team_id").is_null())

    if len(unmatched) > 0:
        print(unmatched)
        raise ValueError("Some players lack team id")

    players = players.drop("team")
