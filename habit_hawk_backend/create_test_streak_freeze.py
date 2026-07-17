"""Script to create test streak freezes for development/testing."""

import argparse

from database.connection import SessionLocal, init_db
from database.models import FreezeStatus, Habit, StreakFreeze, User


def create_test_streak_freeze(username: str, count: int, habit_id: int | None = None):
    """Create one or more available streak freezes for a test user."""
    init_db()

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.username == username).first()
        if not user:
            print(f"[ERROR] User '{username}' not found")
            return

        if habit_id is not None:
            habit = db.query(Habit).filter(
                Habit.habit_id == habit_id,
                Habit.user_id == user.user_id,
            ).first()
            if not habit:
                print(f"[ERROR] Habit {habit_id} not found for user '{username}'")
                return

        created_freezes: list[int] = []
        for _ in range(count):
            streak_freeze = StreakFreeze(
                user_id=user.user_id,
                habit_id=None,
                status=FreezeStatus.available,
            )
            db.add(streak_freeze)
            db.flush()
            created_freezes.append(streak_freeze.freeze_id)

        db.commit()

        print("[SUCCESS] Streak freeze(s) created successfully!")
        print(f"   Username: {username}")
        print(f"   User ID: {user.user_id}")
        if habit_id is not None:
            print(f"   Target Habit ID: {habit_id}")
        print(f"   Created Freeze IDs: {', '.join(str(freeze_id) for freeze_id in created_freezes)}")
        print(f"   Status: {FreezeStatus.available.value}")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error creating streak freeze(s): {e}")
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Create test streak freezes")
    parser.add_argument(
        "--username",
        default="abernabel",
        help="Username to attach the test freeze to",
    )
    parser.add_argument(
        "--count",
        type=int,
        default=1,
        help="Number of freezes to create",
    )
    parser.add_argument(
        "--habit-id",
        type=int,
        default=None,
        help="Optional habit ID to validate belongs to the user",
    )
    args = parser.parse_args()

    create_test_streak_freeze(args.username, args.count, args.habit_id)
