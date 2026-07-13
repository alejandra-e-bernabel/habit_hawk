"""Pydantic schemas for leaderboard operations."""

from datetime import date
from typing import Optional

from pydantic import BaseModel


class LeaderboardEntry(BaseModel):
    """Single entry in the weekly leaderboard."""

    rank: int
    user_id: int
    username: str
    total_score: int
    is_current_user: bool = False

    class Config:
        from_attributes = True


class LeaderboardResponse(BaseModel):
    """Response model for weekly leaderboard."""

    week_start: date
    week_end: date
    entries: list[LeaderboardEntry]
    total_users: int


class UserWeeklyStats(BaseModel):
    """Current user's weekly statistics."""

    user_id: int
    username: str
    total_score: int
    rank: Optional[int] = None  # None if user has no score this week
    week_start: date
    week_end: date
    friends_count: int  # Number of friends on the leaderboard

    class Config:
        from_attributes = True
