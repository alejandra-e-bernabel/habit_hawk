"""Authentication routes."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth.crud import (
    authenticate_user,
    create_access_token,
    create_user,
    get_current_user,
    get_user_by_username,
    update_user_profile,
)
from auth.schemas import (
    LoginRequest,
    ProfileUpdateRequest,
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
        first_name=registration.first_name,
        last_name=registration.last_name,
        profile_icon_name=registration.profile_icon_name,
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


@router.put("/profile", response_model=UserResponse)
async def update_profile(
    profile_update: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Update the current user's profile information.

    Allows updating:
    - first_name
    - last_name
    - profile_icon_name

    Returns the updated user information.
    """
    updated_user = update_user_profile(
        db=db,
        user=current_user,
        first_name=profile_update.first_name,
        last_name=profile_update.last_name,
        profile_icon_name=profile_update.profile_icon_name,
    )
    return updated_user
