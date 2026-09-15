from sqlalchemy.ext.asyncio import AsyncSession
from starlette.requests import Request

from authentication.auth import create_refresh_token
from models.models import Email, RefreshToken, User
from utils.config import get_settings
from utils.utils import hash

settings = get_settings()


async def create_email_user(
    db: AsyncSession,
    username: str = "svcuser",
    email: str = "svc@example.com",
    password: str = "password",
) -> tuple[User, Email]:
    user = User(username=username, best_score=0.0)
    email_login = Email(email=email, hashed_password=hash(password), user=user)

    db.add(user)
    db.add(email_login)

    await db.commit()
    await db.refresh(user)

    return user, email_login


async def create_refresh_token_for_user(
    db: AsyncSession,
    user: User,
) -> tuple:
    token = create_refresh_token({"sub": str(user.id)}, settings)

    refresh = RefreshToken(
        expires_at=token.expires_at,
        jti=token.jti,
        user=user,
    )

    db.add(refresh)
    await db.commit()

    return token, refresh


def request_with_cookies(**cookies: str) -> Request:
    cookie_header = "; ".join(f"{k}={v}" for k, v in cookies.items())

    return Request(
        {
            "type": "http",
            "headers": [(b"cookie", cookie_header.encode())],
        }
    )
