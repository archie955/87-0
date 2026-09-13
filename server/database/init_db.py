import asyncio

from database.init_players import process_players, Categories
from database.init_teams import process_teams


async def init_db_wrapper() -> Categories | dict[str, str]:
    team = await process_teams()
    if team["status"] == "success":
        res = await process_players()
        return res
    return {"status": "failure"}


def main():
    asyncio.run(init_db_wrapper())


if __name__ == "__main__":
    main()
