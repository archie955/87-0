from awpy import Demo
from pathlib import Path
import polars as pl

# note: the idea here is to log opens and create a probability function based on circumstance at death of winning the opening duel, then I can asses how much someone overperforms.

relative_path = "./demos/9z-vs-parivision-m1-mirage.dem"
dir = Path(__file__).parent

path = dir.joinpath(relative_path)

demo = Demo(path)

print("file updated")

demo.parse(player_props=["X", "Y", "Z", "health", "armor_value", "spotted",
                        "has_helmet", "active_weapon", "direction", "is_airborne",
                        "velocity_X", "velocity_Y", "velocity_Z", "flash_duration",
                        "flash_max_alpha", "shots_fired"])

print("done")

kills = demo.kills

shots = demo.shots

rounds = set()

data = pl.DataFrame(schema=[("opener", pl.String), ("won", pl.Boolean),
                            ("opener_health", pl.Int32), ("ct_health", pl.Int32),
                            ("opener_weapon", pl.String), ("ct_weapon", pl.String),
                            ], orient="row")
rows = []

for kill in kills.iter_rows(named=True):
    if kill["round_num"] in rounds:
        continue
    rounds.add(kill["round_num"])

    if kill["attacker_side"] == "t":
        rows.append([kill["attacker_name"]])
    rows.append([])