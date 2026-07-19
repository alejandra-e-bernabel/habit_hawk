"""Pydantic schemas for habit operations."""

from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, Field

from database.models import HabitStatus, HabitType, HabitPeriod, LogStatus


class HabitCreate(BaseModel):
    """Request model for creating a new habit."""

    name: str = Field(..., min_length=1, max_length=120)
    motivation_note: Optional[str] = Field(None, max_length=1000)
    icon_name: Optional[str] = Field(None, max_length=50, description="Icon identifier for UI")
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
    icon_name: Optional[str] = Field(None, max_length=50, description="Icon identifier for UI")
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
    icon_name: Optional[str]
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

    # Optional feedback/journaling
    note: Optional[str] = Field(None, max_length=2000, description="Optional journal note for this session")
    session_rating: Optional[int] = Field(None, ge=1, le=5, description="Optional 1-5 star rating")


class HabitLogUpdate(BaseModel):
    """Request model for updating an existing habit log."""

    status: Optional[LogStatus] = None
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    duration_minutes: Optional[int] = Field(None, ge=1)
    note: Optional[str] = Field(None, max_length=2000)
    session_rating: Optional[int] = Field(None, ge=1, le=5)


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
    note: Optional[str]
    session_rating: Optional[int]
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
    period: HabitPeriod  # Daily, weekly, or monthly
    target_count: int
    target_duration_minutes: Optional[int]
    is_completed: bool  # Whether completed TODAY (for daily habits)
    is_period_goal_met: bool  # Whether period goal is met (daily: same as is_completed, weekly: count >= target, monthly: monthly_completed)
    log_status: Optional[LogStatus] = None
    current_streak: int

    # Weekly progress (for weekly habits only)
    weekly_completed_count: Optional[int] = None  # Number of completions this week (0-N)

    # Monthly progress (for monthly habits only)
    monthly_completed: Optional[bool] = None  # Whether completed this month
    monthly_days_until_due: Optional[int] = None  # Days until end of month

    class Config:
        from_attributes = True


class TodayHabitsResponse(BaseModel):
    """Response model for today's habits."""

    date: date
    total_habits: int
    completed_count: int
    habits: list[TodayHabitItem]


class HabitStatsResponse(BaseModel):
    """Response model for habit statistics and progress."""

    habit_id: int
    total_sessions: int
    completion_rate_7days: float  # % completed in last 7 days
    completion_rate_30days: float  # % completed in last 30 days
    completion_rate_all_time: float  # % completed overall
    average_session_duration: Optional[float]  # minutes, only for log-type
    total_duration_minutes: Optional[int]  # total time logged
    average_rating: Optional[float]  # average of session ratings
    notes_count: int  # number of sessions with notes
    current_streak: int
    longest_streak: int
    last_completed_date: Optional[date]


# ---------------------------------------------------------------------------
# Statistics Page Schemas
# ---------------------------------------------------------------------------


class StatisticsOverviewResponse(BaseModel):
    """Response model for statistics overview metrics."""

    range: str  # "week", "month", or "all_time"
    current_streak: int  # Max current streak across all habits (always live)
    longest_streak: int  # Max longest streak across all habits (always live)
    total_points: int  # Sum of score_earned for the range
    completion_rate: float  # Percentage: completed_count / due_count
    completed_count: int  # Count of completed logs in range


class WeeklyProgressDay(BaseModel):
    """Single day in the weekly progress chart."""

    date: date
    day_name: str  # "Mon", "Tue", etc.
    completed_count: int
    frozen_count: int
    is_today: bool


class WeeklyProgressResponse(BaseModel):
    """Response model for weekly progress chart."""

    week_start: date  # Monday
    week_end: date  # Sunday
    days: list[WeeklyProgressDay]
    total_completed: int
    total_frozen: int


class HabitBreakdownItem(BaseModel):
    """Single habit in the breakdown list."""

    habit_id: int
    name: str
    icon_name: Optional[str]
    completed_count: int
    due_count: int
    completion_rate: float  # completed_count / due_count


class HabitBreakdownResponse(BaseModel):
    """Response model for habit breakdown."""

    range: str  # "week", "month", or "all_time"
    habits: list[HabitBreakdownItem]
