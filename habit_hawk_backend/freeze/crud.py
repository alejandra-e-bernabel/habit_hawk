"""CRUD operations for streak freezes."""

from datetime import date, datetime, timedelta

import pytz
from fastapi import HTTPException, status
from sqlalchemy import and_
from sqlalchemy.orm import Session

from database.models import (
    FreezeStatus,
    Habit,
    HabitStreak,
    HabitLog,
    LogStatus,
    StreakFreeze,
    User,
)
from freeze.schemas import FreezeApplyRequest, FreezeInventoryResponse, HabitFreezeProgress
from habit.crud import get_habit_by_id, update_streak_on_log


FREEZE_STREAK_INTERVAL = 7


def calculate_days_until_next_freeze(current_streak: int) -> int:
    """Return how many streak days remain until the next freeze reward."""
    streak_progress = current_streak % FREEZE_STREAK_INTERVAL
    if streak_progress == 0:
        return FREEZE_STREAK_INTERVAL
    return FREEZE_STREAK_INTERVAL - streak_progress


def count_earned_freezes_for_logs(logs: list[HabitLog]) -> int:
    """Count how many freeze rewards a habit has earned across its log history."""
    earned_count = 0
    streak_length = 0
    expected_date: date | None = None

    for log in logs:
        if log.status == LogStatus.frozen:
            if expected_date is None or log.logged_for_date == expected_date:
                expected_date = log.logged_for_date + timedelta(days=1)
                continue
            streak_length = 0
            expected_date = None
            continue

        if log.status != LogStatus.completed:
            streak_length = 0
            expected_date = None
            continue

        if expected_date is None or log.logged_for_date == expected_date:
            streak_length += 1
        else:
            streak_length = 1

        if streak_length % FREEZE_STREAK_INTERVAL == 0:
            earned_count += 1

        expected_date = log.logged_for_date + timedelta(days=1)

    return earned_count


def count_earned_freezes_for_habit(db: Session, habit_id: int) -> int:
    """Count the number of freeze rewards earned by a single habit."""
    logs = db.query(HabitLog).filter(HabitLog.habit_id == habit_id).order_by(
        HabitLog.logged_for_date.asc()
    ).all()
    return count_earned_freezes_for_logs(logs)


def sync_user_freeze_inventory(db: Session, user: User) -> None:
    """Backfill missing freeze records based on earned streak milestones."""
    habit_ids = db.query(Habit.habit_id).filter(Habit.user_id == user.user_id).all()
    earned_count = sum(count_earned_freezes_for_habit(db, habit_id) for (habit_id,) in habit_ids)
    existing_count = db.query(StreakFreeze).filter(StreakFreeze.user_id == user.user_id).count()

    missing_count = earned_count - existing_count
    if missing_count <= 0:
        return

    for _ in range(missing_count):
        db.add(
            StreakFreeze(
                user_id=user.user_id,
                status=FreezeStatus.available,
            )
        )

    db.commit()


def get_freeze_by_id(db: Session, freeze_id: int, user_id: int) -> StreakFreeze:
    """Fetch a freeze by ID and verify ownership."""
    streak_freeze = db.query(StreakFreeze).filter(
        StreakFreeze.freeze_id == freeze_id
    ).first()

    if not streak_freeze:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Freeze with id {freeze_id} not found",
        )

    if streak_freeze.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to access this freeze",
        )

    return streak_freeze


def get_freeze_inventory(db: Session, user: User) -> FreezeInventoryResponse:
    """Return the user's freeze inventory and total earned count."""
    sync_user_freeze_inventory(db, user)

    freezes = db.query(StreakFreeze).filter(StreakFreeze.user_id == user.user_id).order_by(
        StreakFreeze.acquired_at.desc()
    ).all()

    available_count = sum(1 for item in freezes if item.status == FreezeStatus.available)
    applied_count = sum(1 for item in freezes if item.status == FreezeStatus.applied)
    consumed_count = sum(1 for item in freezes if item.status == FreezeStatus.consumed)

    return FreezeInventoryResponse(
        total_earned_count=len(freezes),
        available_count=available_count,
        applied_count=applied_count,
        consumed_count=consumed_count,
        freezes=freezes,
    )


def get_habit_freeze_progress(db: Session, user: User) -> list[HabitFreezeProgress]:
    """Return each habit's progress toward the next streak-earned freeze."""
    habits = db.query(Habit).filter(Habit.user_id == user.user_id).order_by(
        Habit.created_at.asc()
    ).all()

    progress_items: list[HabitFreezeProgress] = []
    for habit in habits:
        streak_record = db.query(HabitStreak).filter(
            HabitStreak.habit_id == habit.habit_id
        ).first()
        current_streak = streak_record.current_streak if streak_record else 0
        freezes_earned_count = count_earned_freezes_for_habit(db, habit.habit_id)
        progress_items.append(
            HabitFreezeProgress(
                habit_id=habit.habit_id,
                habit_name=habit.name,
                current_streak=current_streak,
                freezes_earned_count=freezes_earned_count,
                days_until_next_freeze=calculate_days_until_next_freeze(current_streak),
            )
        )

    return progress_items


def apply_freeze(
    db: Session, freeze_id: int, apply_data: FreezeApplyRequest, user: User
) -> StreakFreeze:
    """Apply an available freeze to a habit by creating a frozen habit log."""
    sync_user_freeze_inventory(db, user)

    streak_freeze = get_freeze_by_id(db, freeze_id, user.user_id)

    if streak_freeze.status != FreezeStatus.available:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only available freezes can be applied",
        )

    habit = get_habit_by_id(db, apply_data.habit_id, user.user_id)

    if apply_data.applied_to_date:
        log_date = apply_data.applied_to_date
    else:
        tz = pytz.timezone(user.timezone)
        log_date = datetime.now(tz).date()

    existing_log = db.query(HabitLog).filter(
        and_(
            HabitLog.habit_id == habit.habit_id,
            HabitLog.logged_for_date == log_date,
        )
    ).first()

    if existing_log:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"A log entry already exists for {log_date}",
        )

    db.add(
        HabitLog(
            habit_id=habit.habit_id,
            user_id=user.user_id,
            logged_for_date=log_date,
            status=LogStatus.frozen,
            score_earned=0,
        )
    )
    db.flush()

    streak_freeze.habit_id = habit.habit_id
    streak_freeze.applied_to_date = log_date
    streak_freeze.status = FreezeStatus.consumed

    update_streak_on_log(db, habit)

    db.commit()
    db.refresh(streak_freeze)

    return streak_freeze
