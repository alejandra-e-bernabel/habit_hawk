"""API routes for streak freeze management."""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from auth.crud import get_current_user
from database.connection import get_db
from database.models import User
from freeze.crud import apply_freeze, get_freeze_inventory, get_habit_freeze_progress
from freeze.schemas import (
    FreezeApplyRequest,
    HabitFreezeProgress,
    FreezeInventoryResponse,
    FreezeResponse,
)

router = APIRouter(prefix="/freezes", tags=["Freezes"])


@router.get("", response_model=FreezeInventoryResponse)
def list_freezes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get the authenticated user's freeze inventory and earned counts."""
    return get_freeze_inventory(db, current_user)


@router.get("/progress", response_model=list[HabitFreezeProgress])
def list_habit_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get per-habit progress toward the next streak-earned freeze."""
    return get_habit_freeze_progress(db, current_user)


@router.post("/{freeze_id}/apply", response_model=FreezeResponse)
def apply_existing_freeze(
    freeze_id: int,
    apply_data: FreezeApplyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Apply an owned freeze to a habit/date and record a frozen log entry."""
    return apply_freeze(db, freeze_id, apply_data, current_user)
