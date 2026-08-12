from typing import Any

from httpx import AsyncClient, Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.models import Historic_Player, Historic_Team, Player, Team
from tests.mockdata import mock_igl_bonus

SQLALCHEMY_DATABASE_URL = (
    "postgresql+psycopg://postgres:postgres@localhost:5433/test_db"
)


class AuthClient:
    def __init__(
        self, client: AsyncClient, user: dict[str, str], db: AsyncSession
    ) -> None:
        self.client = client
        self.db = db
        self.user = user

    def auth_headers(self, expired: bool = False) -> dict[str, str]:
        token = self.user["access_token"]
        if expired:
            token = "expired_token"
        return {"Authorization": f"Bearer {token}"}

    async def request(self, method: str, url: str, **kwargs: Any) -> Response:
        headers: dict[str, str] = kwargs.pop("headers", {})
        headers.update(self.auth_headers())
        response = await self.client.request(method, url, headers=headers, **kwargs)
        return response

    async def get(self, url: str, **kwargs: Any) -> Response:
        response = await self.request(method="GET", url=url, **kwargs)
        return response

    async def post(self, url: str, **kwargs: Any) -> Response:
        response = await self.request(method="POST", url=url, **kwargs)
        return response

    async def put(self, url: str, **kwargs: Any) -> Response:
        response = await self.request(method="PUT", url=url, **kwargs)
        return response

    async def delete(self, url: str, **kwargs: Any) -> Response:
        response = await self.request(method="DELETE", url=url, **kwargs)
        return response

    async def noauth_get(self, url: str, **kwargs: Any) -> Response:
        response = await self.client.get(url=url, **kwargs)
        return response

    async def noauth_post(self, url: str, **kwargs: Any) -> Response:
        response = await self.client.post(url=url, **kwargs)
        return response

    async def noauth_put(self, url: str, **kwargs: Any) -> Response:
        response = await self.client.put(url=url, **kwargs)
        return response

    async def noauth_delete(self, url: str, **kwargs: Any) -> Response:
        response = await self.client.delete(url=url, **kwargs)
        return response

    async def seed_data(self, data: dict[str, Any]) -> None:
        for t in data["teams"]:
            team = Team(name=t["name"])
            hteam = Historic_Team(name=t["name"])
            self.db.add(instance=team)
            self.db.add(instance=hteam)
            await self.db.flush()

        teams = (await self.db.execute(select(Team))).scalars().all()
        team_dict = {}
        for team in teams:
            team_dict[team.name] = team

        hteams = (await self.db.execute(select(Historic_Team))).scalars().all()
        hteam_dict = {}
        for team in hteams:
            hteam_dict[team.name] = team

        for p in data["players"]:
            p["igl_bonus"] = mock_igl_bonus(p)
            player = Player(
                name=p["name"],
                role=p["role"],
                hltv=p["hltv"],
                igl_bonus=p["igl_bonus"],
                majors=p["majors"],
                wins=p["wins"],
                second=p["second"],
                semi=p["semi"],
                quarter=p["quarter"],
                total_tournaments=p["total_tournaments"],
                major_teammates=p["major_teammates"],
                win_teammates=p["win_teammates"],
                team=team_dict[p["team_name"]],
            )
            hplayer = Historic_Player(
                name=p["name"],
                role=p["role"],
                hltv=p["hltv"],
                igl_bonus=p["igl_bonus"],
                majors=p["majors"],
                wins=p["wins"],
                second=p["second"],
                semi=p["semi"],
                quarter=p["quarter"],
                total_tournaments=p["total_tournaments"],
                major_teammates=p["major_teammates"],
                win_teammates=p["win_teammates"],
                team=hteam_dict[p["team_name"]],
            )
            self.db.add(player)
            self.db.add(hplayer)
            await self.db.flush()
