"""Authentication routes."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth.crud import (
    authenticate_user,
    create_access_token,
    create_user,
    get_current_user,
    get_user_by_username,
)
from auth.schemas import (
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    UserResponse,
)
from database.connection import get_db
from database.models import User

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED,)
def register(
    registration: RegisterRequest,
    db: Session = Depends(get_db),
):
    """Create a new user and return a JWT access token."""
    existing_user = get_user_by_username(db, registration.username)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username is already registered",
        )
    user = create_user(
        db=db,
        username=registration.username,
        password=registration.password,
        timezone_name=registration.timezone,
    )

    access_token = create_access_token(data={"sub": user.username})

    return TokenResponse(access_token=access_token)

@router.post("/login", response_model=TokenResponse)
def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate a user and return a JWT access token.

    The token should be included in subsequent requests as:
    Authorization: Bearer <token>
    """
    user = authenticate_user(db, credentials.username, credentials.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create JWT with username as the subject
    access_token = create_access_token(data={"sub": user.username})

    return TokenResponse(access_token=access_token)


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """
    Get the current authenticated user's information.

    This is a protected route that requires a valid JWT token.
    Use this to verify your token is working correctly.
    """
    return current_user
