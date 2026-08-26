from datetime import datetime

from sqlalchemy import DateTime, Integer, func
from sqlalchemy.orm import Mapped, declared_attr, mapped_column


class Name:
    """define table name and id primary key for all models that use this class"""

    @declared_attr.directive
    def __tablename__(self) -> str:
        return self.__class__.__name__.lower()

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True, nullable=False
    )


class TimeStamps:
    """Automatically adds created_at and updated_at columns to any inheriting tables"""

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )
