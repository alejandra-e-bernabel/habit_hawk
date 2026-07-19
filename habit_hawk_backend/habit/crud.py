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
    HabitPeriod,
    HabitScheduleDay,
    HabitStreak,
    LogStatus,
    User,
)
from habit.schemas import (
    HabitCreate,
    HabitLogCreate,
    HabitLogUpdate,
    HabitStatsResponse,
    HabitUpdate,
    TodayHabitItem,
    StatisticsOverviewResponse,
    WeeklyProgressDay,
    WeeklyProgressResponse,
    HabitBreakdownItem,
    HabitBreakdownResponse,
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


def calculate_streak_metrics(logs: list[HabitLog]) -> tuple[int, int, Optional[date]]:
    """Calculate streak metrics where frozen logs bridge gaps but do not count as days."""
    current_streak = 0
    longest_streak = 0
    last_completed_date = None
    expected_date = None

    for log in logs:
        if log.status == LogStatus.frozen:
            expected_date = (log.logged_for_date + timedelta(days=1)) if expected_date is None else expected_date
            if log.logged_for_date == expected_date - timedelta(days=1):
                expected_date = log.logged_for_date + timedelta(days=1)
            continue

        if log.status != LogStatus.completed:
            current_streak = 0
            expected_date = None
            continue

        if expected_date is None or log.logged_for_date == expected_date:
            current_streak += 1
        else:
            current_streak = 1

        longest_streak = max(longest_streak, current_streak)
        last_completed_date = log.logged_for_date
        expected_date = log.logged_for_date + timedelta(days=1)

    return current_streak, longest_streak, last_completed_date


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

    current_streak, longest_streak, last_completed_date = calculate_streak_metrics(logs)

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


def get_week_start(target_date: date, timezone_str: str) -> date:
    """
    Get the Monday (start) of the week containing the target date.

    Args:
        target_date: The date to find the week start for
        timezone_str: IANA timezone string

    Returns:
        Date of Monday at start of week
    """
    # Monday is 0, Sunday is 6
    days_since_monday = target_date.weekday()
    week_start = target_date - timedelta(days=days_since_monday)
    return week_start


def get_month_end(target_date: date) -> date:
    """
    Get the last day of the month containing the target date.

    Args:
        target_date: The date to find the month end for

    Returns:
        Last date of the month
    """
    # Go to first day of next month, then subtract one day
    if target_date.month == 12:
        next_month = target_date.replace(year=target_date.year + 1, month=1, day=1)
    else:
        next_month = target_date.replace(month=target_date.month + 1, day=1)

    month_end = next_month - timedelta(days=1)
    return month_end


def count_completed_logs(
    db: Session, habit_id: int, start_date: date, end_date: date
) -> int:
    """
    Count the number of completed logs for a habit in a date range.

    Args:
        db: Database session
        habit_id: ID of the habit
        start_date: Start of date range (inclusive)
        end_date: End of date range (inclusive)

    Returns:
        Count of completed logs
    """
    count = db.query(HabitLog).filter(
        and_(
            HabitLog.habit_id == habit_id,
            HabitLog.logged_for_date >= start_date,
            HabitLog.logged_for_date <= end_date,
            HabitLog.status == LogStatus.completed
        )
    ).count()
    return count


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

        # Initialize weekly/monthly fields
        weekly_completed_count = None
        monthly_completed = None
        monthly_days_until_due = None

        # Calculate period-specific data
        if habit.period == HabitPeriod.weekly:
            # Get week bounds (Monday to Sunday)
            week_start = get_week_start(today, user.timezone)
            week_end = week_start + timedelta(days=6)

            # Count completed logs this week
            weekly_completed_count = count_completed_logs(
                db, habit.habit_id, week_start, week_end
            )

        elif habit.period == HabitPeriod.monthly:
            # Get month bounds
            month_start = today.replace(day=1)
            month_end = get_month_end(today)

            # Check if any log exists for this month with completed status
            month_log = db.query(HabitLog).filter(
                and_(
                    HabitLog.habit_id == habit.habit_id,
                    HabitLog.logged_for_date >= month_start,
                    HabitLog.logged_for_date <= month_end,
                    HabitLog.status == LogStatus.completed
                )
            ).first()

            monthly_completed = month_log is not None
            monthly_days_until_due = (month_end - today).days

        # Calculate period-specific goal completion
        is_period_goal_met = False
        if habit.period == HabitPeriod.daily:
            is_period_goal_met = today_log is not None and today_log.status == LogStatus.completed
        elif habit.period == HabitPeriod.weekly:
            is_period_goal_met = (weekly_completed_count or 0) >= habit.target_count
        elif habit.period == HabitPeriod.monthly:
            is_period_goal_met = monthly_completed or False

        result.append(TodayHabitItem(
            habit_id=habit.habit_id,
            name=habit.name,
            habit_type=habit.habit_type,
            period=habit.period,
            target_count=habit.target_count,
            target_duration_minutes=habit.target_duration_minutes,
            is_completed=today_log is not None and today_log.status == LogStatus.completed,
            is_period_goal_met=is_period_goal_met,
            log_status=today_log.status if today_log else None,
            current_streak=streak_info.current_streak if streak_info else 0,
            weekly_completed_count=weekly_completed_count,
            monthly_completed=monthly_completed,
            monthly_days_until_due=monthly_days_until_due,
        ))

    return result


def get_habit_stats(db: Session, habit_id: int, user: User) -> HabitStatsResponse:
    """
    Get comprehensive statistics for a habit.

    Args:
        db: Database session
        habit_id: ID of the habit
        user: Authenticated user

    Returns:
        HabitStatsResponse with statistics

    Raises:
        HTTPException: If habit not found or user doesn't own it
    """
    # Verify habit ownership
    habit = get_habit_by_id(db, habit_id, user.user_id)

    # Get timezone info
    tz = pytz.timezone(user.timezone)
    today = datetime.now(tz).date()

    # Get all logs for this habit
    all_logs = db.query(HabitLog).filter(HabitLog.habit_id == habit_id).all()

    # Total sessions
    total_sessions = len(all_logs)

    # Calculate completion rates
    completed_logs = [log for log in all_logs if log.status == LogStatus.completed]

    # 7 days
    seven_days_ago = today - timedelta(days=7)
    logs_7d = [log for log in all_logs if log.logged_for_date >= seven_days_ago]
    completed_7d = [log for log in logs_7d if log.status == LogStatus.completed]
    completion_rate_7days = (len(completed_7d) / len(logs_7d) * 100) if logs_7d else 0.0

    # 30 days
    thirty_days_ago = today - timedelta(days=30)
    logs_30d = [log for log in all_logs if log.logged_for_date >= thirty_days_ago]
    completed_30d = [log for log in logs_30d if log.status == LogStatus.completed]
    completion_rate_30days = (len(completed_30d) / len(logs_30d) * 100) if logs_30d else 0.0

    # All time
    completion_rate_all_time = (len(completed_logs) / total_sessions * 100) if total_sessions else 0.0

    # Duration stats (only for log-type habits)
    duration_logs = [log for log in completed_logs if log.duration_minutes is not None]
    average_session_duration = None
    total_duration_minutes = None
    if duration_logs:
        total_duration_minutes = sum(log.duration_minutes for log in duration_logs)
        average_session_duration = total_duration_minutes / len(duration_logs)

    # Rating stats
    rated_logs = [log for log in all_logs if log.session_rating is not None]
    average_rating = None
    if rated_logs:
        average_rating = sum(log.session_rating for log in rated_logs) / len(rated_logs)

    # Notes count
    notes_count = len([log for log in all_logs if log.note])

    # Streak info
    streak_info = db.query(HabitStreak).filter(
        HabitStreak.habit_id == habit_id
    ).first()

    return HabitStatsResponse(
        habit_id=habit_id,
        total_sessions=total_sessions,
        completion_rate_7days=round(completion_rate_7days, 2),
        completion_rate_30days=round(completion_rate_30days, 2),
        completion_rate_all_time=round(completion_rate_all_time, 2),
        average_session_duration=round(average_session_duration, 2) if average_session_duration else None,
        total_duration_minutes=total_duration_minutes,
        average_rating=round(average_rating, 2) if average_rating else None,
        notes_count=notes_count,
        current_streak=streak_info.current_streak if streak_info else 0,
        longest_streak=streak_info.longest_streak if streak_info else 0,
        last_completed_date=streak_info.last_completed_date if streak_info else None
    )


# ---------------------------------------------------------------------------
# Statistics Page Operations
# ---------------------------------------------------------------------------


def _get_date_range(range_type: str, user_tz: str) -> tuple[date, date]:
    """
    Get the start and end dates for a given range type.

    Args:
        range_type: "week", "month", or "all_time"
        user_tz: User's timezone (IANA name)

    Returns:
        Tuple of (start_date, end_date) inclusive
    """
    tz = pytz.timezone(user_tz)
    now = datetime.now(tz)
    today = now.date()

    if range_type == "week":
        # Current week: Monday to Sunday
        days_since_monday = today.weekday()  # 0=Monday, 6=Sunday
        week_start = today - timedelta(days=days_since_monday)
        week_end = week_start + timedelta(days=6)
        return week_start, week_end
    elif range_type == "month":
        # Current month
        month_start = today.replace(day=1)
        # Get last day of month
        if today.month == 12:
            next_month = today.replace(year=today.year + 1, month=1, day=1)
        else:
            next_month = today.replace(month=today.month + 1, day=1)
        month_end = next_month - timedelta(days=1)
        return month_start, month_end
    else:  # "all_time"
        # Use a very early date for all time
        return date(2000, 1, 1), today


def _calculate_due_count(habit: Habit, start_date: date, end_date: date) -> int:
    """
    Calculate the number of times a habit was due in a date range.

    Args:
        habit: Habit object
        start_date: Start of range (inclusive)
        end_date: End of range (inclusive)

    Returns:
        Number of due occurrences
    """
    from database.models import HabitPeriod

    # If habit started after the range, return 0
    if habit.started_on and habit.started_on > end_date:
        return 0

    # Adjust start date if habit started later
    actual_start = max(start_date, habit.started_on) if habit.started_on else start_date

    days_in_range = (end_date - actual_start).days + 1

    if habit.period == HabitPeriod.daily:
        # Daily habits: one per day (unless specific days scheduled)
        if habit.schedule_days:
            # Count matching weekdays in range
            count = 0
            current = actual_start
            while current <= end_date:
                if current.weekday() in habit.schedule_days:
                    count += habit.target_count
                current += timedelta(days=1)
            return count
        else:
            return days_in_range * habit.target_count
    elif habit.period == HabitPeriod.weekly:
        weeks_in_range = days_in_range // 7 + (1 if days_in_range % 7 > 0 else 0)
        # Weekly habits: target_count times per week
        # schedule_days are suggestions, not requirements for due_count
        return weeks_in_range * habit.target_count
    else:  # monthly
        months_in_range = (end_date.year - actual_start.year) * 12 + (end_date.month - actual_start.month) + 1
        return months_in_range * habit.target_count


def get_statistics_overview(db: Session, user: User, range_type: str) -> StatisticsOverviewResponse:
    """
    Get statistics overview for the user.

    Args:
        db: Database session
        user: Current user
        range_type: "week", "month", or "all_time"

    Returns:
        StatisticsOverviewResponse with aggregated metrics
    """
    start_date, end_date = _get_date_range(range_type, user.timezone)

    # Get all active habits
    habits = db.query(Habit).filter(
        Habit.user_id == user.user_id,
        Habit.is_active == True
    ).all()

    # Current streak: max across all habits (always live, not range-dependent)
    streak_data = db.query(
        func.max(HabitStreak.current_streak).label("max_current"),
        func.max(HabitStreak.longest_streak).label("max_longest")
    ).filter(
        HabitStreak.habit_id.in_([h.habit_id for h in habits])
    ).first()

    current_streak = streak_data.max_current or 0
    longest_streak = streak_data.max_longest or 0

    # Total points in range
    total_points = db.query(func.sum(HabitLog.score_earned)).filter(
        HabitLog.user_id == user.user_id,
        HabitLog.logged_for_date >= start_date,
        HabitLog.logged_for_date <= end_date
    ).scalar() or 0

    # Completed count in range
    completed_count = db.query(func.count(HabitLog.log_id)).filter(
        HabitLog.user_id == user.user_id,
        HabitLog.logged_for_date >= start_date,
        HabitLog.logged_for_date <= end_date,
        HabitLog.status == LogStatus.completed
    ).scalar() or 0

    # Calculate total due count (exclude frozen from denominator)
    total_due = 0
    for habit in habits:
        total_due += _calculate_due_count(habit, start_date, end_date)

    # Subtract frozen logs from due count
    frozen_count = db.query(func.count(HabitLog.log_id)).filter(
        HabitLog.user_id == user.user_id,
        HabitLog.logged_for_date >= start_date,
        HabitLog.logged_for_date <= end_date,
        HabitLog.status == LogStatus.frozen
    ).scalar() or 0

    total_due -= frozen_count

    # Completion rate
    completion_rate = (completed_count / total_due * 100) if total_due > 0 else 0.0

    return StatisticsOverviewResponse(
        range=range_type,
        current_streak=current_streak,
        longest_streak=longest_streak,
        total_points=total_points,
        completion_rate=round(completion_rate, 2),
        completed_count=completed_count
    )


def get_weekly_progress(db: Session, user: User) -> WeeklyProgressResponse:
    """
    Get weekly progress chart data (Monday to Sunday of current week).

    Args:
        db: Database session
        user: Current user

    Returns:
        WeeklyProgressResponse with daily breakdown
    """
    tz = pytz.timezone(user.timezone)
    now = datetime.now(tz)
    today = now.date()

    # Get current week (Monday to Sunday)
    days_since_monday = today.weekday()
    week_start = today - timedelta(days=days_since_monday)
    week_end = week_start + timedelta(days=6)

    # Query logs for the week, grouped by day and status
    logs_query = db.query(
        HabitLog.logged_for_date,
        HabitLog.status,
        func.count(HabitLog.log_id).label("count")
    ).filter(
        HabitLog.user_id == user.user_id,
        HabitLog.logged_for_date >= week_start,
        HabitLog.logged_for_date <= week_end
    ).group_by(HabitLog.logged_for_date, HabitLog.status).all()

    # Build a dict for quick lookup
    day_data = {}
    for log_date, status, count in logs_query:
        if log_date not in day_data:
            day_data[log_date] = {"completed": 0, "frozen": 0}
        if status == LogStatus.completed:
            day_data[log_date]["completed"] += count
        elif status == LogStatus.frozen:
            day_data[log_date]["frozen"] += count

    # Build response for all 7 days
    days = []
    day_names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    total_completed = 0
    total_frozen = 0

    for i in range(7):
        current_date = week_start + timedelta(days=i)
        data = day_data.get(current_date, {"completed": 0, "frozen": 0})

        days.append(WeeklyProgressDay(
            date=current_date,
            day_name=day_names[i],
            completed_count=data["completed"],
            frozen_count=data["frozen"],
            is_today=(current_date == today)
        ))

        total_completed += data["completed"]
        total_frozen += data["frozen"]

    return WeeklyProgressResponse(
        week_start=week_start,
        week_end=week_end,
        days=days,
        total_completed=total_completed,
        total_frozen=total_frozen
    )


def get_habit_breakdown(db: Session, user: User, range_type: str) -> HabitBreakdownResponse:
    """
    Get per-habit breakdown for the selected range.

    Args:
        db: Database session
        user: Current user
        range_type: "week", "month", or "all_time"

    Returns:
        HabitBreakdownResponse with per-habit stats
    """
    start_date, end_date = _get_date_range(range_type, user.timezone)

    # Get all active habits
    habits = db.query(Habit).filter(
        Habit.user_id == user.user_id,
        Habit.is_active == True
    ).all()

    breakdown_items = []

    for habit in habits:
        # Count completed logs for this habit in range
        completed_count = db.query(func.count(HabitLog.log_id)).filter(
            HabitLog.habit_id == habit.habit_id,
            HabitLog.logged_for_date >= start_date,
            HabitLog.logged_for_date <= end_date,
            HabitLog.status == LogStatus.completed
        ).scalar() or 0

        # Calculate due count
        due_count = _calculate_due_count(habit, start_date, end_date)

        # Subtract frozen logs
        frozen_count = db.query(func.count(HabitLog.log_id)).filter(
            HabitLog.habit_id == habit.habit_id,
            HabitLog.logged_for_date >= start_date,
            HabitLog.logged_for_date <= end_date,
            HabitLog.status == LogStatus.frozen
        ).scalar() or 0

        due_count -= frozen_count

        # Completion rate
        completion_rate = (completed_count / due_count * 100) if due_count > 0 else 0.0

        breakdown_items.append(HabitBreakdownItem(
            habit_id=habit.habit_id,
            name=habit.name,
            icon_name=habit.icon_name,
            completed_count=completed_count,
            due_count=due_count,
            completion_rate=round(completion_rate, 2)
        ))

    # Sort by completion rate descending
    breakdown_items.sort(key=lambda x: x.completion_rate, reverse=True)

    return HabitBreakdownResponse(
        range=range_type,
        habits=breakdown_items
    )
