"""Setup password hashing scheme.

Returns two functions for hashing and verification
"""

from pwdlib import PasswordHash
from pwdlib.hashers.argon2 import Argon2Hasher

pwd_context = PasswordHash(hashers=[Argon2Hasher()])


def hash(password: str) -> str:
    """Hash the provided password string using Argon2 Hashing.

    Parameters
    ----------
    password : str
        Unicode password

    Returns:
    -------
    str
        Hashed password

    """
    return pwd_context.hash(password)


def verify(plain_password: str, hashed_password: str) -> bool:
    """Verify the provided plain_password string is the same as the hashed_password.

    Parameters
    ----------
    plain_password : str
        Unicode password
    hashed_password : str
        Hashed password

    Returns:
    -------
    bool
        Whether the plain password transforms into
        the hashed password under the hashing scheme.

    """
    return pwd_context.verify(plain_password, hashed_password)
