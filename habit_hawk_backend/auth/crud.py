"""Authentication CRUD operations and utilities."""

from datetime import datetime, timedelta, timezone
from typing import Optional

import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from config import settings
from database.connection import get_db
from database.models import User

# HTTP Bearer token scheme
security = HTTPBearer()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against its hash."""
    return bcrypt.checkpw(
        plain_password.encode("utf-8"), hashed_password.encode("utf-8")
    )


def get_password_hash(password: str) -> str:
    """Hash a password using bcrypt."""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")


def get_user_by_username(db: Session, username: str) -> Optional[User]:
    """Fetch a user by username."""
    return db.query(User).filter(User.username == username).first()

def create_user(
    db: Session,
    username: str,
    password: str,
    timezone_name: str = "America/New_York",
    first_name: str | None = None,
    last_name: str | None = None,
    profile_icon_name: str | None = None,
) -> User:
    """Create and persist a new user with a hashed password"""
    user = User(
        username=username,
        password_hash=get_password_hash(password),
        timezone=timezone_name,
        first_name=first_name,
        last_name=last_name,
        profile_icon_name=profile_icon_name,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.jwt_expiration_minutes
        )

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm
    )
    return encoded_jwt


def authenticate_user(db: Session, username: str, password: str) -> Optional[User]:
    """Authenticate a user by username and password."""
    user = get_user_by_username(db, username)
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user


def update_user_profile(
    db: Session,
    user: User,
    first_name: str | None = None,
    last_name: str | None = None,
    profile_icon_name: str | None = None,
) -> User:
    """Update user profile information."""
    if first_name is not None:
        user.first_name = first_name
    if last_name is not None:
        user.last_name = last_name
    if profile_icon_name is not None:
        user.profile_icon_name = profile_icon_name

    db.commit()
    db.refresh(user)
    return user


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    """
    Dependency to get the current authenticated user from JWT token.

    Usage:
        @app.get("/protected")
        def protected_route(user: User = Depends(get_current_user)):
            return {"user_id": user.user_id}
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    token = credentials.credentials

    try:
        payload = jwt.decode(
            token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm]
        )
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = get_user_by_username(db, username=username)
    if user is None:
        raise credentials_exception

    return user
