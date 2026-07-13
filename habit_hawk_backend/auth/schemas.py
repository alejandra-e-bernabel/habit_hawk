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

class TokenResponse(BaseModel):
    """Response model for successful authentication."""

    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    """Response model for user data (no password)."""

    user_id: int
    username: str
    timezone: str

    class Config:
        from_attributes = True  # Allows conversion from SQLAlchemy models
