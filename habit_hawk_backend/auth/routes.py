"""Authentication routes."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth.crud import authenticate_user, create_access_token, get_current_user
from auth.schemas import LoginRequest, TokenResponse, UserResponse
from database.connection import get_db
from database.models import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


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
