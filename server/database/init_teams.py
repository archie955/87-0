from pathlib import Path

from database.database import AsyncSessionLocal
from models.models import Team

"""
IGL Bonus is calculated as:
"""

DATA_DIR = Path(__file__).parent


async def process_teams():
    # lazy import pandas so it isnt loaded in lifespan unless necessary
    import pandas as pd
    teams = pd.read_csv(DATA_DIR / "teams.csv")

    async with AsyncSessionLocal() as db:
        teams = teams.to_dict(orient="records")

        for team in teams:
            db.add(Team(**team))

        await db.commit()
    return {"status": "success"}
