"""CRUD operations for habits."""

from datetime import date, datetime, timedelta
from typing import Optional

import pytz
from fastapi import HTTPException, status
from sqlalchemy import and_, func
from sqlalchemy.orm import Session

from database.models import (
    CurrencyReason,
    CurrencyTransaction,
    Habit,
    HabitLog,
    HabitScheduleDay,
    HabitStreak,
    LogStatus,
    User,
)
from habit.schemas import (
    HabitCreate,
    HabitLogCreate,
    HabitLogUpdate,
    HabitUpdate,
    TodayHabitItem,
)


def get_habit_by_id(db: Session, habit_id: int, user_id: int) -> Habit:
    """
    Fetch a habit by ID and verify ownership.

    Args:
        db: Database session
        habit_id: ID of the habit to fetch
        user_id: ID of the user making the request

    Returns:
        Habit object if found and owned by user

    Raises:
        HTTPException: 404 if habit not found, 403 if user doesn't own it
    """
    habit = db.query(Habit).filter(Habit.habit_id == habit_id).first()

    if not habit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Habit with id {habit_id} not found"
        )

    if habit.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to access this habit"
        )

    return habit


def get_all_habits(db: Session, user: User) -> list[Habit]:
    """
    Get all habits belonging to the authenticated user.

    Args:
        db: Database session
        user: Authenticated user

    Returns:
        List of Habit objects, most recently created first
    """
    return (
        db.query(Habit)
        .filter(Habit.user_id == user.user_id)
        .order_by(Habit.habit_id.desc())
        .all()
    )


def create_habit(db: Session, habit_data: HabitCreate, user: User) -> Habit:
    """
    Create a new habit for the authenticated user.

    Args:
        db: Database session
        habit_data: Habit creation data
        user: Authenticated user

    Returns:
        Created Habit object
    """
    # Create the habit
    habit = Habit(
        user_id=user.user_id,
        name=habit_data.name,
        motivation_note=habit_data.motivation_note,
        habit_type=habit_data.habit_type,
        period=habit_data.period,
        target_count=habit_data.target_count,
        target_duration_minutes=habit_data.target_duration_minutes,
        started_on=habit_data.started_on,
    )

    db.add(habit)
    db.flush()  # Get the habit_id without committing

    # Add schedule days if provided
    if habit_data.schedule_days:
        for day in habit_data.schedule_days:
            if 0 <= day <= 6:  # Validate day is between 0 (Mon) and 6 (Sun)
                schedule_day = HabitScheduleDay(habit_id=habit.habit_id, day_of_week=day)
                db.add(schedule_day)

    # Initialize streak tracking
    streak = HabitStreak(habit_id=habit.habit_id)
    db.add(streak)

    db.commit()
    db.refresh(habit)

    return habit


def update_habit(
    db: Session, habit_id: int, habit_data: HabitUpdate, user: User
) -> Habit:
    """
    Update an existing habit.

    Args:
        db: Database session
        habit_id: ID of the habit to update
        habit_data: Updated habit data
        user: Authenticated user

    Returns:
        Updated Habit object

    Raises:
        HTTPException: 404 if habit not found, 403 if user doesn't own it
    """
    habit = get_habit_by_id(db, habit_id, user.user_id)

    # Update fields that are provided (not None)
    update_data = habit_data.model_dump(exclude_unset=True, exclude={"schedule_days"})
    for field, value in update_data.items():
        setattr(habit, field, value)

    # Handle schedule_days separately
    if habit_data.schedule_days is not None:
        # Remove existing schedule days
        db.query(HabitScheduleDay).filter(
            HabitScheduleDay.habit_id == habit_id
        ).delete()

        # Add new schedule days
        for day in habit_data.schedule_days:
            if 0 <= day <= 6:
                schedule_day = HabitScheduleDay(habit_id=habit.habit_id, day_of_week=day)
                db.add(schedule_day)

    db.commit()
    db.refresh(habit)

    return habit


def delete_habit(db: Session, habit_id: int, user: User) -> dict:
    """
    Delete a habit.

    Args:
        db: Database session
        habit_id: ID of the habit to delete
        user: Authenticated user

    Returns:
        Success message

    Raises:
        HTTPException: 404 if habit not found, 403 if user doesn't own it
    """
    habit = get_habit_by_id(db, habit_id, user.user_id)

    db.delete(habit)
    db.commit()

    return {"message": f"Habit '{habit.name}' deleted successfully"}


# ---------------------------------------------------------------------------
# Habit Logging Functions
# ---------------------------------------------------------------------------


def calculate_score(habit: Habit, log_status: LogStatus, duration_minutes: Optional[int] = None) -> tuple[int, int]:
    """
    Calculate leaderboard score and spendable currency for a habit log.

    Args:
        habit: The habit being logged
        log_status: Status of the log (completed/incomplete/skipped)
        duration_minutes: Duration of the session (for log-type habits)

    Returns:
        Tuple of (leaderboard_score, spendable_currency)
    """
    if log_status != LogStatus.completed:
        return 0, 0

    # Base points for completion
    leaderboard_score = 10
    spendable_currency = 5

    # Bonus for meeting duration target (log-type habits)
    if habit.target_duration_minutes and duration_minutes:
        if duration_minutes >= habit.target_duration_minutes:
            leaderboard_score += 5
            spendable_currency += 2

    return leaderboard_score, spendable_currency


def update_streak_on_log(db: Session, habit: Habit) -> None:
    """
    Recalculate and update the habit streak based on log history.

    Streaks count consecutive days with 'completed' or 'frozen' status.
    Breaks on 'incomplete' or 'skipped' or missing days.

    Args:
        db: Database session
        habit: The habit to update streak for
    """
    streak_record = db.query(HabitStreak).filter(
        HabitStreak.habit_id == habit.habit_id
    ).first()

    if not streak_record:
        # Create streak record if it doesn't exist
        streak_record = HabitStreak(habit_id=habit.habit_id)
        db.add(streak_record)

    # Get all logs for this habit, ordered by date descending
    logs = db.query(HabitLog).filter(
        HabitLog.habit_id == habit.habit_id
    ).order_by(HabitLog.logged_for_date.desc()).all()

    if not logs:
        streak_record.current_streak = 0
        streak_record.longest_streak = 0
        streak_record.last_completed_date = None
        db.commit()
        return

    # Calculate current streak (working backwards from most recent)
    current_streak = 0
    last_completed_date = None
    expected_date = None

    for log in logs:
        # Only count completed or frozen
        if log.status not in [LogStatus.completed, LogStatus.frozen]:
            break

        # Check if this is consecutive
        if expected_date is None or log.logged_for_date == expected_date:
            current_streak += 1
            if log.status == LogStatus.completed and last_completed_date is None:
                last_completed_date = log.logged_for_date
            expected_date = log.logged_for_date - timedelta(days=1)
        else:
            # Gap in streak
            break

    # Calculate longest streak (scan all history)
    longest_streak = 0
    temp_streak = 0
    temp_expected = None

    for log in reversed(logs):  # Go forward in time
        if log.status in [LogStatus.completed, LogStatus.frozen]:
            if temp_expected is None or log.logged_for_date == temp_expected:
                temp_streak += 1
                longest_streak = max(longest_streak, temp_streak)
                temp_expected = log.logged_for_date + timedelta(days=1)
            else:
                # Reset streak
                temp_streak = 1
                temp_expected = log.logged_for_date + timedelta(days=1)
        else:
            # Streak broken
            temp_streak = 0
            temp_expected = None

    streak_record.current_streak = current_streak
    streak_record.longest_streak = max(longest_streak, current_streak)
    streak_record.last_completed_date = last_completed_date
    db.commit()


def create_habit_log(
    db: Session, habit_id: int, log_data: HabitLogCreate, user: User
) -> HabitLog:
    """
    Create a new habit log entry.

    Args:
        db: Database session
        habit_id: ID of the habit to log
        log_data: Log creation data
        user: Authenticated user

    Returns:
        Created HabitLog object

    Raises:
        HTTPException: If habit not found, user doesn't own it, or log already exists for date
    """
    # Verify habit ownership
    habit = get_habit_by_id(db, habit_id, user.user_id)

    # Determine the date (use today in user's timezone if not provided)
    if log_data.logged_for_date:
        log_date = log_data.logged_for_date
    else:
        tz = pytz.timezone(user.timezone)
        now = datetime.now(tz)
        log_date = now.date()

    # Check if log already exists for this date
    existing_log = db.query(HabitLog).filter(
        and_(
            HabitLog.habit_id == habit_id,
            HabitLog.logged_for_date == log_date
        )
    ).first()

    if existing_log:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"A log entry already exists for {log_date}. Use PUT to update it."
        )

    # Validate status (cannot create frozen logs directly)
    if log_data.status == LogStatus.frozen:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Frozen status can only be set through the freeze system"
        )

    # Calculate scores
    leaderboard_score, spendable_currency = calculate_score(
        habit, log_data.status, log_data.duration_minutes
    )

    # Create the log
    habit_log = HabitLog(
        habit_id=habit_id,
        user_id=user.user_id,
        logged_for_date=log_date,
        status=log_data.status,
        started_at=log_data.started_at,
        ended_at=log_data.ended_at,
        duration_minutes=log_data.duration_minutes,
        score_earned=leaderboard_score
    )

    db.add(habit_log)
    db.flush()  # Get the log_id

    # Update streak
    update_streak_on_log(db, habit)

    # Create currency transaction if currency earned
    if spendable_currency > 0:
        currency_txn = CurrencyTransaction(
            user_id=user.user_id,
            amount=spendable_currency,
            reason=CurrencyReason.earned,
            related_habit_id=habit_id
        )
        db.add(currency_txn)

    db.commit()
    db.refresh(habit_log)

    return habit_log


def update_habit_log(
    db: Session, habit_id: int, log_date: date, log_data: HabitLogUpdate, user: User
) -> HabitLog:
    """
    Update an existing habit log.

    Args:
        db: Database session
        habit_id: ID of the habit
        log_date: Date of the log to update
        log_data: Updated log data
        user: Authenticated user

    Returns:
        Updated HabitLog object

    Raises:
        HTTPException: If habit or log not found, or user doesn't own it
    """
    # Verify habit ownership
    habit = get_habit_by_id(db, habit_id, user.user_id)

    # Find the log
    habit_log = db.query(HabitLog).filter(
        and_(
            HabitLog.habit_id == habit_id,
            HabitLog.logged_for_date == log_date
        )
    ).first()

    if not habit_log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No log entry found for habit {habit_id} on {log_date}"
        )

    # Store old status for comparison
    old_status = habit_log.status

    # Update fields
    update_data = log_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(habit_log, field, value)

    # Recalculate score if status changed
    if log_data.status and log_data.status != old_status:
        leaderboard_score, spendable_currency = calculate_score(
            habit, habit_log.status, habit_log.duration_minutes
        )

        # Calculate currency difference
        _, old_currency = calculate_score(habit, old_status, habit_log.duration_minutes)
        currency_diff = spendable_currency - old_currency

        habit_log.score_earned = leaderboard_score

        # Adjust currency if needed
        if currency_diff != 0:
            currency_txn = CurrencyTransaction(
                user_id=user.user_id,
                amount=currency_diff,
                reason=CurrencyReason.earned if currency_diff > 0 else CurrencyReason.refund,
                related_habit_id=habit_id
            )
            db.add(currency_txn)

    # Update streak
    update_streak_on_log(db, habit)

    db.commit()
    db.refresh(habit_log)

    return habit_log


def get_habit_logs(
    db: Session,
    habit_id: int,
    user: User,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
) -> list[HabitLog]:
    """
    Get all logs for a habit, optionally filtered by date range.

    Args:
        db: Database session
        habit_id: ID of the habit
        user: Authenticated user
        start_date: Optional start date filter
        end_date: Optional end date filter

    Returns:
        List of HabitLog objects

    Raises:
        HTTPException: If habit not found or user doesn't own it
    """
    # Verify habit ownership
    get_habit_by_id(db, habit_id, user.user_id)

    query = db.query(HabitLog).filter(HabitLog.habit_id == habit_id)

    if start_date:
        query = query.filter(HabitLog.logged_for_date >= start_date)
    if end_date:
        query = query.filter(HabitLog.logged_for_date <= end_date)

    return query.order_by(HabitLog.logged_for_date.desc()).all()


def delete_habit_log(
    db: Session, habit_id: int, log_date: date, user: User
) -> dict:
    """
    Delete a habit log entry.

    Args:
        db: Database session
        habit_id: ID of the habit
        log_date: Date of the log to delete
        user: Authenticated user

    Returns:
        Success message

    Raises:
        HTTPException: If habit or log not found, or user doesn't own it
    """
    # Verify habit ownership
    habit = get_habit_by_id(db, habit_id, user.user_id)

    # Find the log
    habit_log = db.query(HabitLog).filter(
        and_(
            HabitLog.habit_id == habit_id,
            HabitLog.logged_for_date == log_date
        )
    ).first()

    if not habit_log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No log entry found for habit {habit_id} on {log_date}"
        )

    # Refund currency if any was earned
    if habit_log.score_earned > 0:
        _, old_currency = calculate_score(habit, habit_log.status, habit_log.duration_minutes)
        if old_currency > 0:
            currency_txn = CurrencyTransaction(
                user_id=user.user_id,
                amount=-old_currency,
                reason=CurrencyReason.refund,
                related_habit_id=habit_id
            )
            db.add(currency_txn)

    db.delete(habit_log)
    db.flush()

    # Update streak after deletion
    update_streak_on_log(db, habit)

    db.commit()

    return {"message": f"Log for {log_date} deleted successfully"}


def get_todays_habits(db: Session, user: User) -> list[TodayHabitItem]:
    """
    Get all active habits for today with their completion status.

    Args:
        db: Database session
        user: Authenticated user

    Returns:
        List of TodayHabitItem objects
    """
    # Get today's date in user's timezone
    tz = pytz.timezone(user.timezone)
    today = datetime.now(tz).date()

    # Get all active habits
    habits = db.query(Habit).filter(
        and_(
            Habit.user_id == user.user_id,
            Habit.is_active == True
        )
    ).all()

    result = []
    for habit in habits:
        # Get streak info
        streak_info = db.query(HabitStreak).filter(
            HabitStreak.habit_id == habit.habit_id
        ).first()

        # Check if logged today
        today_log = db.query(HabitLog).filter(
            and_(
                HabitLog.habit_id == habit.habit_id,
                HabitLog.logged_for_date == today
            )
        ).first()

        result.append(TodayHabitItem(
            habit_id=habit.habit_id,
            name=habit.name,
            habit_type=habit.habit_type,
            target_count=habit.target_count,
            target_duration_minutes=habit.target_duration_minutes,
            is_completed=today_log is not None and today_log.status == LogStatus.completed,
            log_status=today_log.status if today_log else None,
            current_streak=streak_info.current_streak if streak_info else 0
        ))

    return result
