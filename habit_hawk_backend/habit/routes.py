"""API routes for habit management."""

from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from auth.crud import get_current_user
from database.connection import get_db
from database.models import User
from habit.crud import (
    create_habit,
    create_habit_log,
    delete_habit,
    delete_habit_log,
    get_all_habits,
    get_habit_by_id,
    get_habit_logs,
    get_todays_habits,
    update_habit,
    update_habit_log,
)
from habit.schemas import (
    HabitCreate,
    HabitLogCreate,
    HabitLogResponse,
    HabitLogUpdate,
    HabitResponse,
    HabitUpdate,
    TodayHabitsResponse,
)

router = APIRouter(prefix="/habits", tags=["Habits"])


@router.get("", response_model=list[HabitResponse])
def list_habits(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get all habits belonging to the authenticated user.

    Requires a valid JWT token in the Authorization header.
    """
    return get_all_habits(db, current_user)


@router.post("", response_model=HabitResponse, status_code=status.HTTP_201_CREATED)
def create_new_habit(
    habit_data: HabitCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Create a new habit for the authenticated user.

    Requires a valid JWT token in the Authorization header.
    """
    habit = create_habit(db, habit_data, current_user)
    return habit


@router.put("/{habit_id}", response_model=HabitResponse)
def update_existing_habit(
    habit_id: int,
    habit_data: HabitUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update an existing habit.

    Only the owner of the habit can update it.
    Requires a valid JWT token in the Authorization header.
    """
    habit = update_habit(db, habit_id, habit_data, current_user)
    return habit


@router.delete("/{habit_id}", status_code=status.HTTP_200_OK)
def delete_existing_habit(
    habit_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Delete a habit.

    Only the owner of the habit can delete it.
    Requires a valid JWT token in the Authorization header.
    """
    result = delete_habit(db, habit_id, current_user)
    return result


# ---------------------------------------------------------------------------
# Habit Logging Routes
# ---------------------------------------------------------------------------


@router.post("/{habit_id}/logs", response_model=HabitLogResponse, status_code=status.HTTP_201_CREATED)
def log_habit(
    habit_id: int,
    log_data: HabitLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Log a habit completion, skip, or incomplete.

    Creates a new log entry for the specified habit. If no date is provided,
    defaults to today in the user's timezone.

    Automatically:
    - Calculates and awards leaderboard score and spendable currency
    - Updates habit streak (current and longest)
    - Creates currency transaction for spendable currency earned

    Requires a valid JWT token in the Authorization header.
    """
    habit_log = create_habit_log(db, habit_id, log_data, current_user)
    return habit_log


@router.put("/{habit_id}/logs/{log_date}", response_model=HabitLogResponse)
def update_log(
    habit_id: int,
    log_date: date,
    log_data: HabitLogUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update an existing habit log.

    Can change the status or session details. Automatically recalculates
    scores, streak, and currency if status changes.

    Requires a valid JWT token in the Authorization header.
    """
    habit_log = update_habit_log(db, habit_id, log_date, log_data, current_user)
    return habit_log


@router.get("/{habit_id}/logs", response_model=list[HabitLogResponse])
def get_logs(
    habit_id: int,
    start_date: Optional[date] = Query(None, description="Start date filter (inclusive)"),
    end_date: Optional[date] = Query(None, description="End date filter (inclusive)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get all logs for a habit, optionally filtered by date range.

    Returns logs in descending date order (most recent first).

    Requires a valid JWT token in the Authorization header.
    """
    logs = get_habit_logs(db, habit_id, current_user, start_date, end_date)
    return logs


@router.delete("/{habit_id}/logs/{log_date}", status_code=status.HTTP_200_OK)
def delete_log(
    habit_id: int,
    log_date: date,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Delete a habit log entry.

    Automatically:
    - Refunds any spendable currency that was earned
    - Recalculates habit streak after deletion

    Requires a valid JWT token in the Authorization header.
    """
    result = delete_habit_log(db, habit_id, log_date, current_user)
    return result


@router.get("/today", response_model=TodayHabitsResponse)
def get_today_habits(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get all active habits for today with their completion status.

    Returns each habit with:
    - Completion status (is_completed flag)
    - Log status if logged today (completed/incomplete/skipped)
    - Current streak

    Date is calculated based on the user's timezone.

    Requires a valid JWT token in the Authorization header.
    """
    import pytz
    from datetime import datetime

    # Get today's date in user's timezone
    tz = pytz.timezone(current_user.timezone)
    today = datetime.now(tz).date()

    habits = get_todays_habits(db, current_user)

    completed_count = sum(1 for h in habits if h.is_completed)

    return TodayHabitsResponse(
        date=today,
        total_habits=len(habits),
        completed_count=completed_count,
        habits=habits
    )


@router.get("/{habit_id}", response_model=HabitResponse)
def get_single_habit(
    habit_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get a single habit by ID.

    Only the owner of the habit can view it.
    Requires a valid JWT token in the Authorization header.
    """
    return get_habit_by_id(db, habit_id, current_user.user_id)
