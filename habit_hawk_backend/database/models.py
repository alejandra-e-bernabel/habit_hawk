"""
SQLAlchemy models for Habit Hawk — a habit tracker.

Style: SQLAlchemy 2.0 declarative (Mapped / mapped_column). Requires Python 3.10+.

Design decisions baked in here:
  * One habit == one goal. Flat, no nesting / no parent_habit_id.
  * Two separate currency pools:
      - Leaderboard score: never spent. Lives as HabitLog.score_earned and is
        summed live per week. No table of its own.
      - Spendable currency: earned, then spent on freezes. Lives in the
        CurrencyTransaction ledger; balance = SUM(amount).
  * Streak freezes are a per-user pool: StreakFreeze.habit_id is NULL while the
    freeze sits available, and is set only when the freeze is applied.
  * HabitStreak is the one denormalized cache (recompute-on-write off HabitLog).
    Everything else (today's-habits, completion rate, weekly leaderboard) is
    computed live via queries/views, not stored.
  * Leaderboard week starts Monday 00:00 in each user's local time, so User
    carries an IANA timezone string (e.g. "America/New_York").
"""

import enum
from datetime import date, datetime, time

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Date,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Time,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------

class HabitStatus(enum.Enum):
    in_progress = "in_progress"
    completed = "completed"
    archived = "archived"
    paused = "paused"


class HabitType(enum.Enum):
    reminder = "reminder"   # binary nudge: complete / incomplete
    log = "log"             # captures a session, optionally with a duration


class HabitPeriod(enum.Enum):
    daily = "daily"
    weekly = "weekly"
    monthly = "monthly"


class LogStatus(enum.Enum):
    completed = "completed"
    incomplete = "incomplete"
    skipped = "skipped"
    frozen = "frozen"       # a freeze was applied to this due-date


class CurrencyReason(enum.Enum):
    earned = "earned"
    freeze_purchase = "freeze_purchase"
    refund = "refund"
    gift = "gift"


class FreezeStatus(enum.Enum):
    available = "available"   # sitting in the user's pool, habit_id is NULL
    applied = "applied"       # attached to a habit/date, not yet "spent"
    consumed = "consumed"     # used up


class FriendshipStatus(enum.Enum):
    pending = "pending"
    accepted = "accepted"
    blocked = "blocked"


class NotificationStatus(enum.Enum):
    scheduled = "scheduled"
    sent = "sent"
    snoozed = "snoozed"
    dismissed = "dismissed"


# ---------------------------------------------------------------------------
# Identity
# ---------------------------------------------------------------------------

class User(Base):
    __tablename__ = "users"

    user_id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    # IANA timezone name, e.g. "America/New_York" — drives the Monday-00:00-local
    # leaderboard week boundary. Store the name, not a UTC offset, so DST is free.
    timezone: Mapped[str] = mapped_column(String(64), default="UTC")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    habits: Mapped[list["Habit"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    logs: Mapped[list["HabitLog"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    currency_transactions: Mapped[list["CurrencyTransaction"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    freezes: Mapped[list["StreakFreeze"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    notifications: Mapped[list["Notification"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )


# ---------------------------------------------------------------------------
# Habits (== goals)
# ---------------------------------------------------------------------------

class Habit(Base):
    __tablename__ = "habits"

    habit_id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.user_id", ondelete="CASCADE"), index=True
    )

    name: Mapped[str] = mapped_column(String(120))
    motivation_note: Mapped[str | None] = mapped_column(String(1000))  # the "why"

    status: Mapped[HabitStatus] = mapped_column(
        Enum(HabitStatus, name="habit_status"), default=HabitStatus.in_progress
    )
    started_on: Mapped[date | None] = mapped_column(Date)
    completed_on: Mapped[date | None] = mapped_column(Date)

    habit_type: Mapped[HabitType] = mapped_column(
        Enum(HabitType, name="habit_type"), default=HabitType.reminder
    )
    period: Mapped[HabitPeriod] = mapped_column(
        Enum(HabitPeriod, name="habit_period"), default=HabitPeriod.daily
    )
    # e.g. 1 (once a day), or 4 (four times within the period)
    target_count: Mapped[int] = mapped_column(Integer, default=1)
    # only for time-based habits; NULL otherwise
    target_duration_minutes: Mapped[int | None] = mapped_column(Integer)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    user: Mapped["User"] = relationship(back_populates="habits")
    schedule_days: Mapped[list["HabitScheduleDay"]] = relationship(
        back_populates="habit", cascade="all, delete-orphan"
    )
    logs: Mapped[list["HabitLog"]] = relationship(
        back_populates="habit", cascade="all, delete-orphan"
    )
    streak: Mapped["HabitStreak"] = relationship(
        back_populates="habit", uselist=False, cascade="all, delete-orphan"
    )
    reminders: Mapped[list["HabitReminder"]] = relationship(
        back_populates="habit", cascade="all, delete-orphan"
    )


class HabitScheduleDay(Base):
    """Specific weekdays a habit is due (the M/W/Th/F case).

    Empty for habits that just want "N times a week, any days" — those rely on
    target_count instead.
    """

    __tablename__ = "habit_schedule_days"
    __table_args__ = (
        CheckConstraint("day_of_week BETWEEN 0 AND 6", name="ck_day_of_week_range"),
    )

    habit_id: Mapped[int] = mapped_column(
        ForeignKey("habits.habit_id", ondelete="CASCADE"), primary_key=True
    )
    day_of_week: Mapped[int] = mapped_column(Integer, primary_key=True)  # 0=Mon..6=Sun

    habit: Mapped["Habit"] = relationship(back_populates="schedule_days")


# ---------------------------------------------------------------------------
# Logging & streaks
# ---------------------------------------------------------------------------

class HabitLog(Base):
    """Source of truth for everything streak- and points-related.

    Covers all four buttons in the completion modal: complete / incomplete /
    snooze(skip) / freeze. user_id is denormalized off the habit so leaderboard
    and stats queries don't need the join.
    """

    __tablename__ = "habit_logs"
    __table_args__ = (
        # one outcome per habit per date it counts toward
        UniqueConstraint("habit_id", "logged_for_date", name="uq_log_per_date"),
    )

    log_id: Mapped[int] = mapped_column(primary_key=True)
    habit_id: Mapped[int] = mapped_column(
        ForeignKey("habits.habit_id", ondelete="CASCADE"), index=True
    )
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.user_id", ondelete="CASCADE"), index=True
    )

    # the date this entry counts toward — kept distinct from created_at so late
    # entries and timezones don't corrupt streaks
    logged_for_date: Mapped[date] = mapped_column(Date, index=True)
    status: Mapped[LogStatus] = mapped_column(Enum(LogStatus, name="log_status"))

    # session details — NULL for plain reminder completions, filled for log-type
    started_at: Mapped[datetime | None] = mapped_column(DateTime)
    ended_at: Mapped[datetime | None] = mapped_column(DateTime)
    duration_minutes: Mapped[int | None] = mapped_column(Integer)

    # leaderboard score (the pool that never gets spent)
    score_earned: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    habit: Mapped["Habit"] = relationship(back_populates="logs")
    user: Mapped["User"] = relationship(back_populates="logs")


class HabitStreak(Base):
    """Denormalized streak cache, recomputed on each write to HabitLog.

    Derivable from HabitLog alone, but freezes make the live window query
    annoying, so we cache the running state. One row per habit.
    """

    __tablename__ = "habit_streaks"

    habit_id: Mapped[int] = mapped_column(
        ForeignKey("habits.habit_id", ondelete="CASCADE"), primary_key=True
    )
    current_streak: Mapped[int] = mapped_column(Integer, default=0)
    longest_streak: Mapped[int] = mapped_column(Integer, default=0)
    last_completed_date: Mapped[date | None] = mapped_column(Date)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    habit: Mapped["Habit"] = relationship(back_populates="streak")


# ---------------------------------------------------------------------------
# Spendable currency & freezes
# ---------------------------------------------------------------------------

class CurrencyTransaction(Base):
    """Signed ledger for the spendable pool. Balance = SUM(amount) per user."""

    __tablename__ = "currency_transactions"

    txn_id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.user_id", ondelete="CASCADE"), index=True
    )
    amount: Mapped[int] = mapped_column(Integer)  # signed: +earned, -spent
    reason: Mapped[CurrencyReason] = mapped_column(
        Enum(CurrencyReason, name="currency_reason")
    )
    related_habit_id: Mapped[int | None] = mapped_column(
        ForeignKey("habits.habit_id", ondelete="SET NULL")
    )
    related_freeze_id: Mapped[int | None] = mapped_column(
        ForeignKey("streak_freezes.freeze_id", ondelete="SET NULL")
    )
    occurred_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    user: Mapped["User"] = relationship(back_populates="currency_transactions")


class StreakFreeze(Base):
    """A freeze in the user's pool. habit_id is NULL while available; set only
    when applied. "2 Freezes Left" = COUNT(status == available) for the user.
    """

    __tablename__ = "streak_freezes"

    freeze_id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.user_id", ondelete="CASCADE"), index=True
    )
    habit_id: Mapped[int | None] = mapped_column(
        ForeignKey("habits.habit_id", ondelete="SET NULL")
    )
    status: Mapped[FreezeStatus] = mapped_column(
        Enum(FreezeStatus, name="freeze_status"), default=FreezeStatus.available
    )
    points_spent: Mapped[int] = mapped_column(Integer, default=0)
    acquired_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    applied_to_date: Mapped[date | None] = mapped_column(Date)

    user: Mapped["User"] = relationship(back_populates="freezes")


# ---------------------------------------------------------------------------
# Social
# ---------------------------------------------------------------------------

class Friendship(Base):
    """requester_id and addressee_id both reference users.

    The UniqueConstraint stops the exact same directed pair being stored twice.
    It does NOT stop a mirror duplicate (A->B and B->A) — to prevent that you
    need a functional unique index on (LEAST(a,b), GREATEST(a,b)), which is
    DB-specific, or enforce ordering in the app layer before insert.
    """

    __tablename__ = "friendships"
    __table_args__ = (
        UniqueConstraint("requester_id", "addressee_id", name="uq_friend_pair"),
        CheckConstraint("requester_id <> addressee_id", name="ck_no_self_friend"),
    )

    friendship_id: Mapped[int] = mapped_column(primary_key=True)
    requester_id: Mapped[int] = mapped_column(
        ForeignKey("users.user_id", ondelete="CASCADE"), index=True
    )
    addressee_id: Mapped[int] = mapped_column(
        ForeignKey("users.user_id", ondelete="CASCADE"), index=True
    )
    status: Mapped[FriendshipStatus] = mapped_column(
        Enum(FriendshipStatus, name="friendship_status"),
        default=FriendshipStatus.pending,
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    responded_at: Mapped[datetime | None] = mapped_column(DateTime)

    requester: Mapped["User"] = relationship(foreign_keys=[requester_id])
    addressee: Mapped["User"] = relationship(foreign_keys=[addressee_id])


# ---------------------------------------------------------------------------
# Reminders & notifications
# ---------------------------------------------------------------------------

class HabitReminder(Base):
    """A reminder time for a habit. Separate table so a habit can carry several."""

    __tablename__ = "habit_reminders"

    reminder_id: Mapped[int] = mapped_column(primary_key=True)
    habit_id: Mapped[int] = mapped_column(
        ForeignKey("habits.habit_id", ondelete="CASCADE"), index=True
    )
    remind_at: Mapped[time] = mapped_column(Time)
    is_enabled: Mapped[bool] = mapped_column(Boolean, default=True)

    habit: Mapped["Habit"] = relationship(back_populates="reminders")


class Notification(Base):
    """A scheduled/sent push. Snooze just flips status and sets snoozed_until."""

    __tablename__ = "notifications"

    notification_id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.user_id", ondelete="CASCADE"), index=True
    )
    habit_id: Mapped[int | None] = mapped_column(
        ForeignKey("habits.habit_id", ondelete="CASCADE")
    )
    scheduled_for: Mapped[datetime] = mapped_column(DateTime, index=True)
    sent_at: Mapped[datetime | None] = mapped_column(DateTime)
    status: Mapped[NotificationStatus] = mapped_column(
        Enum(NotificationStatus, name="notification_status"),
        default=NotificationStatus.scheduled,
    )
    snoozed_until: Mapped[datetime | None] = mapped_column(DateTime)

    user: Mapped["User"] = relationship(back_populates="notifications")