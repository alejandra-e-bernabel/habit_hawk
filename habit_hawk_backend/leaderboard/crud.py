"""CRUD operations for leaderboard functionality."""

from datetime import date, datetime, time, timedelta
from typing import Tuple

import pytz
from sqlalchemy import and_, func, or_
from sqlalchemy.orm import Session

from database.models import Friendship, FriendshipStatus, HabitLog, User
from leaderboard.schemas import LeaderboardEntry, LeaderboardResponse, UserWeeklyStats


def get_week_boundaries(user_timezone: str) -> Tuple[datetime, datetime]:
    """
    Calculate the start and end of the current week in the user's timezone.

    Week starts Monday 00:00:00 and ends Sunday 23:59:59.

    Args:
        user_timezone: IANA timezone string (e.g., "America/New_York")

    Returns:
        Tuple of (week_start, week_end) as timezone-aware datetime objects in UTC
    """
    # Get current time in user's timezone
    tz = pytz.timezone(user_timezone)
    now = datetime.now(tz)

    # Calculate Monday of current week (weekday() returns 0 for Monday)
    days_since_monday = now.weekday()
    monday = now - timedelta(days=days_since_monday)

    # Set to Monday 00:00:00
    week_start = tz.localize(
        datetime.combine(monday.date(), time.min)
    )

    # Set to Sunday 23:59:59
    week_end = tz.localize(
        datetime.combine(monday.date() + timedelta(days=6), time.max)
    )

    # Convert to UTC for database queries
    week_start_utc = week_start.astimezone(pytz.utc)
    week_end_utc = week_end.astimezone(pytz.utc)

    return week_start_utc, week_end_utc


def calculate_weekly_leaderboard(
    db: Session, current_user: User
) -> LeaderboardResponse:
    """
    Calculate the weekly leaderboard for the current user and their friends.

    Args:
        db: Database session
        current_user: User requesting the leaderboard

    Returns:
        LeaderboardResponse with ranked entries
    """
    # Get week boundaries in user's timezone
    week_start_utc, week_end_utc = get_week_boundaries(current_user.timezone)

    # Get friend user IDs (both directions of friendship)
    friend_ids_subquery = db.query(
        func.distinct(
            func.case(
                (Friendship.requester_id == current_user.user_id, Friendship.addressee_id),
                else_=Friendship.requester_id
            )
        ).label("friend_id")
    ).filter(
        and_(
            or_(
                Friendship.requester_id == current_user.user_id,
                Friendship.addressee_id == current_user.user_id
            ),
            Friendship.status == FriendshipStatus.accepted
        )
    ).subquery()

    # Include current user and all friends
    user_ids_to_include = [current_user.user_id] + [
        row[0] for row in db.query(friend_ids_subquery.c.friend_id).all()
    ]

    # Query scores for the current week
    scores = db.query(
        HabitLog.user_id,
        User.username,
        func.sum(HabitLog.score_earned).label("total_score")
    ).join(
        User, HabitLog.user_id == User.user_id
    ).filter(
        and_(
            HabitLog.user_id.in_(user_ids_to_include),
            HabitLog.logged_for_date >= week_start_utc.date(),
            HabitLog.logged_for_date <= week_end_utc.date()
        )
    ).group_by(
        HabitLog.user_id, User.username
    ).order_by(
        func.sum(HabitLog.score_earned).desc()
    ).all()

    # Build leaderboard entries with ranks
    entries = []
    for rank, (user_id, username, total_score) in enumerate(scores, start=1):
        entries.append(LeaderboardEntry(
            rank=rank,
            user_id=user_id,
            username=username,
            total_score=total_score or 0,
            is_current_user=(user_id == current_user.user_id)
        ))

    # Include users with no score (0 points)
    users_with_scores = {entry.user_id for entry in entries}
    for user_id in user_ids_to_include:
        if user_id not in users_with_scores:
            user = db.query(User).filter(User.user_id == user_id).first()
            if user:
                entries.append(LeaderboardEntry(
                    rank=len(entries) + 1,
                    user_id=user.user_id,
                    username=user.username,
                    total_score=0,
                    is_current_user=(user_id == current_user.user_id)
                ))

    return LeaderboardResponse(
        week_start=week_start_utc.date(),
        week_end=week_end_utc.date(),
        entries=entries,
        total_users=len(entries)
    )


def get_user_weekly_stats(db: Session, current_user: User) -> UserWeeklyStats:
    """
    Get the current user's weekly statistics and position.

    Args:
        db: Database session
        current_user: User requesting their stats

    Returns:
        UserWeeklyStats with rank and score information
    """
    # Get the full leaderboard to determine rank
    leaderboard = calculate_weekly_leaderboard(db, current_user)

    # Find current user's entry
    user_entry = next(
        (entry for entry in leaderboard.entries if entry.is_current_user),
        None
    )

    # Count friends on the leaderboard (excluding self)
    friends_count = len([e for e in leaderboard.entries if not e.is_current_user])

    if user_entry:
        return UserWeeklyStats(
            user_id=current_user.user_id,
            username=current_user.username,
            total_score=user_entry.total_score,
            rank=user_entry.rank,
            week_start=leaderboard.week_start,
            week_end=leaderboard.week_end,
            friends_count=friends_count
        )
    else:
        # User not on leaderboard (no friends and no score)
        week_start_utc, week_end_utc = get_week_boundaries(current_user.timezone)
        return UserWeeklyStats(
            user_id=current_user.user_id,
            username=current_user.username,
            total_score=0,
            rank=None,
            week_start=week_start_utc.date(),
            week_end=week_end_utc.date(),
            friends_count=0
        )
