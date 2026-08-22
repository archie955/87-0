from pathlib import Path

import polars as pl

"""
IGL Bonus is calculated as:
"""

DATA_DIR = Path(__file__).parent


def process_teams():
    teams = pl.read_csv(DATA_DIR / "teams.csv")
    return teams
