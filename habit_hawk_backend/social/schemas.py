"""Pydantic schemas for social/friendship operations."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from database.models import FriendshipStatus


class FriendRequestCreate(BaseModel):
    """Request model for sending a friend request."""

    username: str = Field(..., min_length=3, max_length=50, description="Username of the user to add as friend")


class UserBasicInfo(BaseModel):
    """Basic user information for friendship responses."""

    user_id: int
    username: str

    class Config:
        from_attributes = True


class FriendshipResponse(BaseModel):
    """Response model for friendship data."""

    friendship_id: int
    requester: UserBasicInfo
    addressee: UserBasicInfo
    status: FriendshipStatus
    created_at: datetime
    responded_at: Optional[datetime]

    class Config:
        from_attributes = True


class FriendListItem(BaseModel):
    """Simplified friend information for list views."""

    friendship_id: int
    user_id: int
    username: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    profile_icon_name: Optional[str] = None
    profile_image_url: Optional[str] = None
    since: datetime  # when friendship was accepted

    class Config:
        from_attributes = True
