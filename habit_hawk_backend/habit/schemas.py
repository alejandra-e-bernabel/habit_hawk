"""Pydantic schemas for habit operations."""

from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, Field

from database.models import HabitStatus, HabitType, HabitPeriod, LogStatus


class HabitCreate(BaseModel):
    """Request model for creating a new habit."""

    name: str = Field(..., min_length=1, max_length=120)
    motivation_note: Optional[str] = Field(None, max_length=1000)
    habit_type: HabitType = Field(default=HabitType.reminder)
    period: HabitPeriod = Field(default=HabitPeriod.daily)
    target_count: int = Field(default=1, ge=1)
    target_duration_minutes: Optional[int] = Field(None, ge=1)
    started_on: Optional[date] = None
    schedule_days: Optional[list[int]] = Field(
        None, description="List of weekdays (0=Mon, 6=Sun) when habit is scheduled"
    )


class HabitUpdate(BaseModel):
    """Request model for updating an existing habit."""

    name: Optional[str] = Field(None, min_length=1, max_length=120)
    motivation_note: Optional[str] = Field(None, max_length=1000)
    status: Optional[HabitStatus] = None
    habit_type: Optional[HabitType] = None
    period: Optional[HabitPeriod] = None
    target_count: Optional[int] = Field(None, ge=1)
    target_duration_minutes: Optional[int] = Field(None, ge=1)
    is_active: Optional[bool] = None
    started_on: Optional[date] = None
    completed_on: Optional[date] = None
    schedule_days: Optional[list[int]] = Field(
        None, description="List of weekdays (0=Mon, 6=Sun) when habit is scheduled"
    )


class HabitResponse(BaseModel):
    """Response model for habit data."""

    habit_id: int
    user_id: int
    name: str
    motivation_note: Optional[str]
    status: HabitStatus
    started_on: Optional[date]
    completed_on: Optional[date]
    habit_type: HabitType
    period: HabitPeriod
    target_count: int
    target_duration_minutes: Optional[int]
    is_active: bool

    class Config:
        from_attributes = True  # Allows conversion from SQLAlchemy models


# ---------------------------------------------------------------------------
# Habit Logging Schemas
# ---------------------------------------------------------------------------


class HabitLogCreate(BaseModel):
    """Request model for logging a habit (complete/incomplete/skip)."""

    logged_for_date: Optional[date] = Field(
        None, description="Date this log counts toward. Defaults to today in user's timezone."
    )
    status: LogStatus = Field(..., description="Completion status: completed, incomplete, or skipped")

    # Session details (only for 'log' type habits)
    started_at: Optional[datetime] = Field(None, description="Session start time")
    ended_at: Optional[datetime] = Field(None, description="Session end time")
    duration_minutes: Optional[int] = Field(None, ge=1, description="Duration in minutes")


class HabitLogUpdate(BaseModel):
    """Request model for updating an existing habit log."""

    status: Optional[LogStatus] = None
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    duration_minutes: Optional[int] = Field(None, ge=1)


class HabitLogResponse(BaseModel):
    """Response model for a habit log entry."""

    log_id: int
    habit_id: int
    user_id: int
    logged_for_date: date
    status: LogStatus
    started_at: Optional[datetime]
    ended_at: Optional[datetime]
    duration_minutes: Optional[int]
    score_earned: int
    created_at: datetime

    class Config:
        from_attributes = True


class HabitStreakResponse(BaseModel):
    """Response model for habit streak information."""

    habit_id: int
    current_streak: int
    longest_streak: int
    last_completed_date: Optional[date]
    updated_at: datetime

    class Config:
        from_attributes = True


class TodayHabitItem(BaseModel):
    """Single habit item for today's habits list."""

    habit_id: int
    name: str
    habit_type: HabitType
    target_count: int
    target_duration_minutes: Optional[int]
    is_completed: bool
    log_status: Optional[LogStatus] = None
    current_streak: int

    class Config:
        from_attributes = True


class TodayHabitsResponse(BaseModel):
    """Response model for today's habits."""

    date: date
    total_habits: int
    completed_count: int
    habits: list[TodayHabitItem]
