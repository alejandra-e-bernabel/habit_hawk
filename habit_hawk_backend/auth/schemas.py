"""Pydantic schemas for authentication."""

from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    """Request model for user login."""

    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6)

class RegisterRequest(BaseModel):
    """Request model for user registration"""
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6)
    timezone: str = Field(default="America/New_York", max_length=64)
    first_name: str | None = Field(None, max_length=100)
    last_name: str | None = Field(None, max_length=100)
    profile_icon_name: str | None = Field(None, max_length=50)

class TokenResponse(BaseModel):
    """Response model for successful authentication."""

    access_token: str
    token_type: str = "bearer"


class ProfileUpdateRequest(BaseModel):
    """Request model for updating user profile."""
    first_name: str | None = Field(None, max_length=100)
    last_name: str | None = Field(None, max_length=100)
    profile_icon_name: str | None = Field(None, max_length=50)


class UserResponse(BaseModel):
    """Response model for user data (no password)."""

    user_id: int
    username: str
    timezone: str
    first_name: str | None = None
    last_name: str | None = None
    profile_icon_name: str | None = None
    profile_image_url: str | None = None

    class Config:
        from_attributes = True  # Allows conversion from SQLAlchemy models
