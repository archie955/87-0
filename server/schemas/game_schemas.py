from datetime import datetime

from pydantic import BaseModel


class Game(BaseModel):
    awper_id: int
    opener_id: int
    closer_id: int
    support_id: int
    flex_id: int
    igl_id: int
    score: float
    updated_at: datetime
