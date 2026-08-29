from typing import Any

import redis.asyncio as redis
from httpx import AsyncClient, Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from models.models import Player, Team
from schemas import player_schemas, team_schemas
from tests.mockdata import mock_igl_bonus

SQLALCHEMY_DATABASE_URL = (
    "postgresql+psycopg://postgres:postgres@localhost:5433/test_db"
)


class AuthClient:
    def __init__(
        self,
        client: AsyncClient,
        user: dict[str, str],
        db: AsyncSession,
        cache: redis.Redis,
    ) -> None:
        self.client = client
        self.db = db
        self.cache = cache
        self.user = user

    def auth_headers(self, expired: bool) -> dict[str, str]:
        token = self.user["access_token"]
        if expired:
            # ruff: ignore[hardcoded-password-string]
            token = "expired_token"
        return {"Authorization": f"Bearer {token}"}

    async def request(self, method: str, url: str, **kwargs: Any) -> Response:
        headers: dict[str, str] = kwargs.pop("headers", {})
        headers.update(self.auth_headers(expired=False))
        return await self.client.request(method, url, headers=headers, **kwargs)

    async def get(self, url: str, **kwargs: Any) -> Response:
        return await self.request(method="GET", url=url, **kwargs)

    async def post(self, url: str, **kwargs: Any) -> Response:
        return await self.request(method="POST", url=url, **kwargs)

    async def put(self, url: str, **kwargs: Any) -> Response:
        return await self.request(method="PUT", url=url, **kwargs)

    async def delete(self, url: str, **kwargs: Any) -> Response:
        return await self.request(method="DELETE", url=url, **kwargs)

    async def noauth_get(self, url: str, **kwargs: Any) -> Response:
        return await self.client.get(url=url, **kwargs)

    async def noauth_post(self, url: str, **kwargs: Any) -> Response:
        return await self.client.post(url=url, **kwargs)

    async def noauth_put(self, url: str, **kwargs: Any) -> Response:
        return await self.client.put(url=url, **kwargs)

    async def noauth_delete(self, url: str, **kwargs: Any) -> Response:
        return await self.client.delete(url=url, **kwargs)

    async def seed_data(self, data: dict[str, Any]) -> None:
        for t in data["teams"]:
            team = Team(name=t["name"])
            self.db.add(team)
            await self.db.flush()

        teams = (await self.db.execute(select(Team))).scalars().all()
        team_dict = {}
        for team in teams:
            team_dict[team.name] = team

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

            self.db.add(player)
            await self.db.flush()

    async def seed_cache(self) -> None:
        teams = (
            (await self.db.execute(select(Team).options(selectinload(Team.players))))
            .scalars()
            .all()
        )
        team_dict = {}

        for t in teams:
            team_dict[t.id] = team_schemas.Team(
                # pyrefly: ignore [bad-argument-type]
                id=t.id,
                # pyrefly: ignore [bad-argument-type]
                name=t.name,
                players=[player_schemas.Player.model_validate(p) for p in t.players],
            )
        teams = team_schemas.Teams.model_validate(team_dict)

        await self.cache.set("teams", teams.model_dump_json())
