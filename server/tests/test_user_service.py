import pytest
from sqlalchemy import select

from exceptions.app_exceptions import (
    DataAlreadyExistsError,
    DataNotFoundError,
)
from models.models import User
from schemas import user_schemas
from services import user_service
from tests.service_helpers import create_email_user
from utils.config import get_settings

settings = get_settings()


async def test_delete_user(db):
    user, _ = await create_email_user(
        db,
        username="deleteuser",
        email="delete@example.com",
    )

    await user_service.delete(db=db, user=user, request_id="1")

    found = (
        await db.execute(select(User).where(User.id == user.id))
    ).scalar_one_or_none()

    assert found is None


async def test_update_username_success(db):
    user, _ = await create_email_user(
        db,
        username="updateuser",
        email="update@example.com",
        password="password",
    )

    await db.refresh(user, attribute_names=["email_login"])

    updated = user_schemas.UserUpdate(
        updated_username="newusername",
        password="password",
    )

    result = await user_service.update(
        db=db, user=user, updated=updated, request_id="1"
    )

    assert result.username == "newusername"


async def test_update_same_username(db):
    user, _ = await create_email_user(
        db,
        username="sameuser",
        email="same@example.com",
        password="password",
    )

    await db.refresh(user, attribute_names=["email_login"])

    updated = user_schemas.UserUpdate(
        updated_username="sameuser",
        password="password",
    )

    with pytest.raises(DataAlreadyExistsError):
        await user_service.update(db=db, user=user, updated=updated, request_id="1")


async def test_update_no_email_login(db):
    user = User(username="noemail", best_score=0.0)

    db.add(user)
    await db.commit()
    await db.refresh(user)

    updated = user_schemas.UserUpdate(
        updated_username="newusername",
        password="password",
    )

    with pytest.raises(DataNotFoundError):
        await user_service.update(db=db, user=user, updated=updated, request_id="1")
