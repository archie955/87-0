import logging

from sqlalchemy.ext.asyncio import AsyncSession

from models.models import User
from services.helpers import safe_commit_delete

logger = logging.getLogger(__name__)


async def delete(db: AsyncSession, user: User):
    await db.delete(user)
    await safe_commit_delete(db, datatype="User")

    logger.info("User deleted", extra={"user_id": user.id})
