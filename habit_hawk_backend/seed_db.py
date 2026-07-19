"""
Database seeding script for Habit Hawk testing.

Creates a comprehensive test dataset including:
- Multiple users with different friendship statuses
- Varied habits (daily/weekly/monthly, reminder/log types)
- Realistic habit logs with streak history
- Currency transactions and freeze inventory
- Schedule days and reminders

Run with: python seed_db.py
"""

from datetime import date, datetime, time, timedelta
import random
from sqlalchemy.orm import Session

from database.connection import SessionLocal, engine
from database.models import (
    Base,
    User,
    Habit,
    HabitLog,
    HabitStreak,
    HabitScheduleDay,
    HabitReminder,
    Friendship,
    CurrencyTransaction,
    StreakFreeze,
    HabitStatus,
    HabitType,
    HabitPeriod,
    LogStatus,
    FriendshipStatus,
    CurrencyReason,
    FreezeStatus,
)
from auth.crud import get_password_hash


def clear_database(db: Session):
    """Clear all existing data from the database."""
    print("🗑️  Clearing existing data...")

    # Drop and recreate all tables
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    print("✅ Database cleared and tables recreated")


def create_users(db: Session) -> dict[str, User]:
    """Create test users with hashed passwords."""
    print("👥 Creating users...")

    users_data = [
        {"username": "test_user", "password": "password123", "timezone": "America/New_York",
         "first_name": "Test", "last_name": "User", "profile_icon_name": "rocket"},
        {"username": "alice_runner", "password": "password123", "timezone": "America/Los_Angeles",
         "first_name": "Alice", "last_name": "Johnson", "profile_icon_name": "fox"},
        {"username": "bob_fitness", "password": "password123", "timezone": "America/Chicago",
         "first_name": "Bob", "last_name": "Martinez", "profile_icon_name": "dumbbell"},
        {"username": "charlie_reader", "password": "password123", "timezone": "Europe/London",
         "first_name": "Charlie", "last_name": "Chen", "profile_icon_name": "owl"},
        {"username": "diana_coder", "password": "password123", "timezone": "Asia/Tokyo",
         "first_name": "Diana", "last_name": "Patel", "profile_icon_name": "gem"},
        {"username": "emma_yogi", "password": "password123", "timezone": "America/Denver",
         "first_name": "Emma", "last_name": "Williams", "profile_icon_name": "flower"},
        {"username": "frank_writer", "password": "password123", "timezone": "America/New_York",
         "first_name": "Frank", "last_name": "Thompson", "profile_icon_name": "music"},
        {"username": "grace_chef", "password": "password123", "timezone": "America/Phoenix",
         "first_name": "Grace", "last_name": "Kim", "profile_icon_name": "pizza"},
        {"username": "henry_musician", "password": "password123", "timezone": "America/Chicago",
         "first_name": "Henry", "last_name": "Garcia", "profile_icon_name": "palette"},
        {"username": "iris_artist", "password": "password123", "timezone": "Europe/Paris",
         "first_name": "Iris", "last_name": "Dubois", "profile_icon_name": "butterfly"},
        {"username": "jack_cyclist", "password": "password123", "timezone": "Europe/Berlin",
         "first_name": "Jack", "last_name": "Mueller", "profile_icon_name": "bike"},
        {"username": "kate_swimmer", "password": "password123", "timezone": "Australia/Sydney",
         "first_name": "Kate", "last_name": "Anderson", "profile_icon_name": "fish"},
        {"username": "leo_climber", "password": "password123", "timezone": "America/Los_Angeles",
         "first_name": "Leo", "last_name": "Santos", "profile_icon_name": "mountain"},
        {"username": "maya_dancer", "password": "password123", "timezone": "Asia/Singapore",
         "first_name": "Maya", "last_name": "Tan", "profile_icon_name": "star"},
        {"username": "noah_gamer", "password": "password123", "timezone": "America/New_York",
         "first_name": "Noah", "last_name": "Brown", "profile_icon_name": "crown"},
    ]

    users = {}
    for user_data in users_data:
        user = User(
            username=user_data["username"],
            password_hash=get_password_hash(user_data["password"]),
            timezone=user_data["timezone"],
            first_name=user_data.get("first_name"),
            last_name=user_data.get("last_name"),
            profile_icon_name=user_data.get("profile_icon_name"),
        )
        db.add(user)
        db.flush()
        users[user_data["username"]] = user
        print(f"  ✓ Created user: {user_data.get('first_name', '')} {user_data.get('last_name', '')} (@{user_data['username']}) (ID: {user.user_id})")

    db.commit()
    return users


def create_friendships(db: Session, users: dict[str, User]):
    """Create friendships with various statuses."""
    print("\n🤝 Creating friendships...")

    test_user = users["test_user"]

    # Create accepted friendships with most users
    accepted_friends = [
        "alice_runner", "bob_fitness", "emma_yogi", "frank_writer",
        "grace_chef", "henry_musician", "iris_artist", "jack_cyclist",
        "kate_swimmer", "leo_climber", "maya_dancer", "noah_gamer"
    ]

    friendships_data = []

    # Add accepted friendships
    for i, friend_name in enumerate(accepted_friends):
        # Alternate between test_user being requester and addressee
        if i % 2 == 0:
            friendships_data.append({
                "requester": test_user,
                "addressee": users[friend_name],
                "status": FriendshipStatus.accepted,
                "responded_at": datetime.now() - timedelta(days=random.randint(5, 60)),
                "desc": f"accepted friend: {friend_name}",
            })
        else:
            friendships_data.append({
                "requester": users[friend_name],
                "addressee": test_user,
                "status": FriendshipStatus.accepted,
                "responded_at": datetime.now() - timedelta(days=random.randint(5, 60)),
                "desc": f"accepted friend: {friend_name}",
            })

    # Add a pending request
    friendships_data.append({
        "requester": test_user,
        "addressee": users["charlie_reader"],
        "status": FriendshipStatus.pending,
        "responded_at": None,
        "desc": "pending outgoing request",
    })

    # Add a blocked user
    friendships_data.append({
        "requester": test_user,
        "addressee": users["diana_coder"],
        "status": FriendshipStatus.blocked,
        "responded_at": datetime.now() - timedelta(days=5),
        "desc": "blocked user",
    })

    for friendship_data in friendships_data:
        friendship = Friendship(
            requester_id=friendship_data["requester"].user_id,
            addressee_id=friendship_data["addressee"].user_id,
            status=friendship_data["status"],
            responded_at=friendship_data["responded_at"],
        )
        db.add(friendship)
        print(f"  ✓ Created friendship: {friendship_data['desc']}")

    db.commit()


def create_habits_for_user(db: Session, user: User, num_habits: int = 7) -> list[Habit]:
    """Create varied habits for a user."""
    print(f"\n📋 Creating habits for {user.username}...")

    habits_data = [
        {
            "name": "Morning Meditation",
            "motivation_note": "Start each day with clarity and focus",
            "icon_name": "meditation",
            "habit_type": HabitType.reminder,
            "period": HabitPeriod.daily,
            "target_count": 1,
            "target_duration_minutes": None,
            "status": HabitStatus.in_progress,
            "started_on": date.today() - timedelta(days=45),
            "schedule_days": None,
            "reminders": [time(7, 0)],
        },
        {
            "name": "Exercise",
            "motivation_note": "Stay healthy and energized",
            "icon_name": "run",
            "habit_type": HabitType.log,
            "period": HabitPeriod.daily,
            "target_count": 1,
            "target_duration_minutes": 30,
            "status": HabitStatus.in_progress,
            "started_on": date.today() - timedelta(days=60),
            "schedule_days": None,
            "reminders": [time(18, 0)],
        },
        {
            "name": "Read for 30 minutes",
            "motivation_note": "Expand knowledge and relax before bed",
            "icon_name": "book",
            "habit_type": HabitType.log,
            "period": HabitPeriod.daily,
            "target_count": 1,
            "target_duration_minutes": 30,
            "status": HabitStatus.in_progress,
            "started_on": date.today() - timedelta(days=30),
            "schedule_days": None,
            "reminders": [time(21, 0)],
        },
        {
            "name": "Gym Workout",
            "motivation_note": "Hit the gym 3 times a week",
            "icon_name": "barbell",
            "habit_type": HabitType.log,
            "period": HabitPeriod.weekly,
            "target_count": 3,
            "target_duration_minutes": 60,
            "status": HabitStatus.in_progress,
            "started_on": date.today() - timedelta(days=90),
            "schedule_days": [0, 2, 4],  # Monday, Wednesday, Friday
            "reminders": [time(17, 30)],
        },
        {
            "name": "Deep Clean Apartment",
            "motivation_note": "Keep living space organized and clean",
            "icon_name": "sparkles",
            "habit_type": HabitType.reminder,
            "period": HabitPeriod.weekly,
            "target_count": 1,
            "target_duration_minutes": None,
            "status": HabitStatus.in_progress,
            "started_on": date.today() - timedelta(days=20),
            "schedule_days": [5],  # Saturday
            "reminders": [time(10, 0)],
        },
        {
            "name": "Review Monthly Budget",
            "motivation_note": "Stay on top of finances",
            "icon_name": "wallet",
            "habit_type": HabitType.reminder,
            "period": HabitPeriod.monthly,
            "target_count": 1,
            "target_duration_minutes": None,
            "status": HabitStatus.in_progress,
            "started_on": date.today() - timedelta(days=120),
            "schedule_days": None,
            "reminders": [],
        },
        {
            "name": "Learn Spanish",
            "motivation_note": "Practice daily for 15 minutes",
            "icon_name": "language",
            "habit_type": HabitType.reminder,
            "period": HabitPeriod.daily,
            "target_count": 1,
            "target_duration_minutes": None,
            "status": HabitStatus.paused,
            "started_on": date.today() - timedelta(days=50),
            "schedule_days": None,
            "reminders": [time(12, 0)],
        },
    ]

    habits = []
    # Limit to num_habits
    for habit_data in habits_data[:num_habits]:
        habit = Habit(
            user_id=user.user_id,
            name=habit_data["name"],
            motivation_note=habit_data["motivation_note"],
            icon_name=habit_data["icon_name"],
            habit_type=habit_data["habit_type"],
            period=habit_data["period"],
            target_count=habit_data["target_count"],
            target_duration_minutes=habit_data["target_duration_minutes"],
            status=habit_data["status"],
            started_on=habit_data["started_on"],
            is_active=habit_data["status"] == HabitStatus.in_progress,
        )
        db.add(habit)
        db.flush()

        # Add schedule days if specified
        if habit_data["schedule_days"]:
            for day in habit_data["schedule_days"]:
                schedule_day = HabitScheduleDay(habit_id=habit.habit_id, day_of_week=day)
                db.add(schedule_day)

        # Add reminders
        for reminder_time in habit_data["reminders"]:
            reminder = HabitReminder(habit_id=habit.habit_id, remind_at=reminder_time)
            db.add(reminder)

        habits.append(habit)
        print(f"  ✓ Created habit: {habit.name} ({habit.habit_type.value}, {habit.period.value})")

    db.commit()
    return habits


def create_habit_logs_and_streaks(db: Session, user: User, habits: list[Habit], include_today: bool = True):
    """Create realistic habit logs with varied completion patterns."""
    print(f"\n📊 Creating habit logs and streaks for {user.username}...")

    today = date.today()

    for habit in habits:
        if habit.status == HabitStatus.paused:
            # Paused habits have some history but stop recently
            days_back = 20
            log_until = today - timedelta(days=10)
        else:
            # Active habits have logs up to today (or yesterday if include_today is False)
            days_back = min(60, (today - habit.started_on).days + 1)
            log_until = today if include_today else today - timedelta(days=1)

        current_streak = 0
        longest_streak = 0
        last_completed_date = None
        temp_streak = 0
        total_score = 0

        # Generate logs with realistic patterns
        for i in range(days_back):
            log_date = log_until - timedelta(days=days_back - i - 1)

            if log_date < habit.started_on:
                continue

            # Determine completion probability based on habit
            if "Meditation" in habit.name:
                # High consistency
                complete_prob = 0.85
            elif "Exercise" in habit.name or "Gym" in habit.name:
                # Medium-high consistency
                complete_prob = 0.75
            elif "Read" in habit.name:
                # Medium consistency
                complete_prob = 0.70
            elif "Clean" in habit.name:
                # Lower consistency
                complete_prob = 0.60
            else:
                complete_prob = 0.70

            # Randomly determine status
            rand_val = random.random()
            if rand_val < complete_prob:
                status = LogStatus.completed
                score = 10
            elif rand_val < complete_prob + 0.10:
                status = LogStatus.skipped
                score = 0
            elif rand_val < complete_prob + 0.12:
                status = LogStatus.frozen
                score = 10  # Frozen counts as completed for streak
            else:
                status = LogStatus.incomplete
                score = 0

            # Create log entry
            log = HabitLog(
                habit_id=habit.habit_id,
                user_id=user.user_id,
                logged_for_date=log_date,
                status=status,
                score_earned=score,
            )

            # Add session details for log-type habits
            if habit.habit_type == HabitType.log and status == LogStatus.completed:
                base_time = datetime.combine(log_date, time(8, 0))
                duration = habit.target_duration_minutes or 30
                # Add some randomness
                duration = int(duration * random.uniform(0.8, 1.2))
                log.duration_minutes = duration
                log.started_at = base_time
                log.ended_at = base_time + timedelta(minutes=duration)

            # Add notes and ratings for some completed sessions
            if status == LogStatus.completed:
                # 40% chance of having a rating
                if random.random() < 0.4:
                    log.session_rating = random.randint(3, 5)  # Mostly positive ratings

                # 30% chance of having a note
                if random.random() < 0.3:
                    notes_pool = [
                        "Felt great today! Really pushed myself.",
                        "Good session, but struggled a bit with focus.",
                        "Amazing progress! Feeling stronger every day.",
                        "Tough session but glad I stuck with it.",
                        "Really enjoying this habit. Seeing improvements!",
                        "Had to cut it short but still counts!",
                        "Perfect way to start/end the day.",
                        "Feeling more energized after this session.",
                        "Challenging but rewarding.",
                        "Best session in a while! Feeling accomplished.",
                        "A bit tired but pushed through.",
                        "Love the consistency I'm building.",
                        "This is becoming easier each time.",
                        "Struggled today but didn't give up.",
                        "Really proud of myself for showing up.",
                        "Could feel the difference from last week.",
                        "Short but effective session.",
                        "Mind was wandering but finished strong.",
                        "Exactly what I needed today.",
                        "Building momentum!",
                    ]
                    log.note = random.choice(notes_pool)

            db.add(log)
            total_score += score

            # Track streaks
            if status in [LogStatus.completed, LogStatus.frozen]:
                temp_streak += 1
                longest_streak = max(longest_streak, temp_streak)
                last_completed_date = log_date
            else:
                temp_streak = 0

        # Current streak is the temp_streak if it extends to today
        if last_completed_date and (log_until - last_completed_date).days <= 1:
            current_streak = temp_streak
        else:
            current_streak = 0

        # Create streak record
        streak = HabitStreak(
            habit_id=habit.habit_id,
            current_streak=current_streak,
            longest_streak=longest_streak,
            last_completed_date=last_completed_date,
        )
        db.add(streak)

        print(f"  ✓ {habit.name}: {current_streak} current streak, {longest_streak} longest, {total_score} total score")

    db.commit()


def create_currency_and_freezes(db: Session, test_user: User, habits: list[Habit]):
    """Create currency transactions and freeze inventory."""
    print("\n💰 Creating currency and freezes...")

    active_habits = [h for h in habits if h.status == HabitStatus.in_progress]

    # Earned currency from completing habits
    total_earned = 0
    for i in range(15):
        habit = random.choice(active_habits)
        amount = random.randint(5, 20)
        txn = CurrencyTransaction(
            user_id=test_user.user_id,
            amount=amount,
            reason=CurrencyReason.earned,
            related_habit_id=habit.habit_id,
            occurred_at=datetime.now() - timedelta(days=random.randint(1, 30)),
        )
        db.add(txn)
        total_earned += amount

    print(f"  ✓ Created {15} currency earnings (total: {total_earned})")

    # Create some freezes
    freeze_count = 5
    for i in range(freeze_count):
        freeze = StreakFreeze(
            user_id=test_user.user_id,
            status=FreezeStatus.available,
            points_spent=50,
            acquired_at=datetime.now() - timedelta(days=random.randint(5, 40)),
        )
        db.add(freeze)
        db.flush()

        # Deduct currency for freeze purchase
        txn = CurrencyTransaction(
            user_id=test_user.user_id,
            amount=-50,
            reason=CurrencyReason.freeze_purchase,
            related_freeze_id=freeze.freeze_id,
            occurred_at=freeze.acquired_at,
        )
        db.add(txn)

    print(f"  ✓ Created {freeze_count} available freezes")

    # Apply some freezes
    applied_count = 2
    for i in range(applied_count):
        freeze = StreakFreeze(
            user_id=test_user.user_id,
            habit_id=random.choice(active_habits).habit_id,
            status=FreezeStatus.applied,
            points_spent=50,
            acquired_at=datetime.now() - timedelta(days=random.randint(10, 30)),
            applied_to_date=date.today() - timedelta(days=random.randint(1, 15)),
        )
        db.add(freeze)
        db.flush()

        txn = CurrencyTransaction(
            user_id=test_user.user_id,
            amount=-50,
            reason=CurrencyReason.freeze_purchase,
            related_freeze_id=freeze.freeze_id,
            occurred_at=freeze.acquired_at,
        )
        db.add(txn)

    print(f"  ✓ Created {applied_count} applied freezes")

    # Create one consumed freeze
    freeze = StreakFreeze(
        user_id=test_user.user_id,
        habit_id=random.choice(active_habits).habit_id,
        status=FreezeStatus.consumed,
        points_spent=50,
        acquired_at=datetime.now() - timedelta(days=45),
        applied_to_date=date.today() - timedelta(days=20),
    )
    db.add(freeze)
    db.flush()

    txn = CurrencyTransaction(
        user_id=test_user.user_id,
        amount=-50,
        reason=CurrencyReason.freeze_purchase,
        related_freeze_id=freeze.freeze_id,
        occurred_at=freeze.acquired_at,
    )
    db.add(txn)

    print(f"  ✓ Created 1 consumed freeze")

    # Add a gift transaction
    gift_txn = CurrencyTransaction(
        user_id=test_user.user_id,
        amount=100,
        reason=CurrencyReason.gift,
        occurred_at=datetime.now() - timedelta(days=7),
    )
    db.add(gift_txn)
    print(f"  ✓ Added gift transaction (+100)")

    db.commit()

    # Calculate final balance
    balance = total_earned - (freeze_count + applied_count + 1) * 50 + 100
    print(f"  💵 Final currency balance: {balance}")


def main():
    """Run the seeding script."""
    print("🌱 Starting database seeding...")
    print("=" * 60)

    db = SessionLocal()
    try:
        # Clear existing data
        clear_database(db)

        # Create all test data
        users = create_users(db)
        create_friendships(db, users)

        # Create habits and logs for test_user (main user)
        test_user = users["test_user"]
        habits = create_habits_for_user(db, test_user, num_habits=7)
        create_habit_logs_and_streaks(db, test_user, habits, include_today=True)
        create_currency_and_freezes(db, test_user, habits)

        # Create habits and logs for all accepted friends
        friend_configs = [
            ("alice_runner", 5),
            ("bob_fitness", 4),
            ("emma_yogi", 6),
            ("frank_writer", 3),
            ("grace_chef", 4),
            ("henry_musician", 5),
            ("iris_artist", 3),
            ("jack_cyclist", 6),
            ("kate_swimmer", 5),
            ("leo_climber", 7),
            ("maya_dancer", 4),
            ("noah_gamer", 3),
        ]

        print("\n📊 Creating habits and logs for friends...")
        for username, num_habits in friend_configs:
            friend = users[username]
            friend_habits = create_habits_for_user(db, friend, num_habits=num_habits)
            create_habit_logs_and_streaks(db, friend, friend_habits, include_today=True)
            print(f"  ✓ Created {num_habits} habits for {username}")

        print("\n" + "=" * 60)
        print("✨ Database seeding completed successfully!")
        print("\n📝 Test Credentials:")
        print("   Username: test_user")
        print("   Password: password123")
        print("\n🎯 You can now test all features with pre-populated data!")

    except Exception as e:
        print(f"\n❌ Error during seeding: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
