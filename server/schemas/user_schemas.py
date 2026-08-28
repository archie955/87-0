from datetime import datetime

from schemas.base_schema import OrmModel
from schemas.email_schemas import EmailOut
from schemas.steam_schemas import SteamOut


class UserOut(OrmModel):
    id: int
    best_score: float | None = None
    steam: SteamOut | None = None
    email: EmailOut | None = None
    created_at: datetime
    updated_at: datetime
