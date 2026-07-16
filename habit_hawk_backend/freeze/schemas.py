"""Pydantic schemas for streak freeze operations."""

from datetime import date, datetime

from pydantic import BaseModel, Field

from database.models import FreezeStatus


class FreezeApplyRequest(BaseModel):
    """Request model for applying a streak freeze to a habit date."""

    habit_id: int = Field(..., gt=0)
    applied_to_date: date | None = Field(
        None,
        description="Date the freeze should protect. Defaults to today in the user's timezone.",
    )


class FreezeResponse(BaseModel):
    """Response model for a streak freeze."""

    freeze_id: int
    user_id: int
    habit_id: int | None
    status: FreezeStatus
    acquired_at: datetime
    applied_to_date: date | None

    class Config:
        from_attributes = True


class FreezeInventoryResponse(BaseModel):
    """Response model for the user's freeze inventory."""

    total_earned_count: int
    available_count: int
    applied_count: int
    consumed_count: int
    freezes: list[FreezeResponse]


class HabitFreezeProgress(BaseModel):
    """Per-habit progress toward the next freeze reward."""

    habit_id: int
    habit_name: str
    current_streak: int
    freezes_earned_count: int
    days_until_next_freeze: int = Field(
        ..., description="How many more streak days are needed to earn the next freeze."
    )
