"""API routes for leaderboard features."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth.crud import get_current_user
from database.connection import get_db
from database.models import User
from leaderboard.crud import calculate_weekly_leaderboard, get_user_weekly_stats
from leaderboard.schemas import LeaderboardResponse, UserWeeklyStats

router = APIRouter(prefix="/leaderboard", tags=["Leaderboard"])


@router.get("/weekly", response_model=LeaderboardResponse)
def get_weekly_leaderboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get the weekly leaderboard for the current user and their friends.

    The leaderboard shows scores for the current week (Monday 00:00 to Sunday 23:59)
    in the user's timezone. Only includes the current user and accepted friends.

    Requires a valid JWT token in the Authorization header.
    """
    leaderboard = calculate_weekly_leaderboard(db, current_user)
    return leaderboard


@router.get("/weekly/me", response_model=UserWeeklyStats)
def get_my_weekly_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get the current user's weekly statistics and leaderboard position.

    Returns the user's rank, total score for the week, and number of friends
    on the leaderboard.

    Requires a valid JWT token in the Authorization header.
    """
    stats = get_user_weekly_stats(db, current_user)
    return stats
