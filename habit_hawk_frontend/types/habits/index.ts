/**
 * Habit types matching backend Pydantic schemas
 */

// Enums
export enum HabitStatus {
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  ARCHIVED = "archived",
  PAUSED = "paused",
}

export enum HabitType {
  REMINDER = "reminder", // binary nudge: complete / incomplete
  LOG = "log", // captures a session, optionally with a duration
}

export enum HabitPeriod {
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
}

export enum LogStatus {
  COMPLETED = "completed",
  INCOMPLETE = "incomplete",
  SKIPPED = "skipped",
  FROZEN = "frozen", // a freeze was applied to this due-date
}

// Habit CRUD types
export interface HabitCreate {
  name: string;
  motivation_note?: string | null;
  habit_type?: HabitType;
  period?: HabitPeriod;
  target_count?: number;
  target_duration_minutes?: number | null;
  started_on?: string | null; // ISO date string
  schedule_days?: number[] | null; // List of weekdays (0=Mon, 6=Sun)
}

export interface HabitUpdate {
  name?: string;
  motivation_note?: string | null;
  status?: HabitStatus;
  habit_type?: HabitType;
  period?: HabitPeriod;
  target_count?: number;
  target_duration_minutes?: number | null;
  is_active?: boolean;
  started_on?: string | null; // ISO date string
  completed_on?: string | null; // ISO date string
  schedule_days?: number[] | null;
}

export interface HabitResponse {
  habit_id: number;
  user_id: number;
  name: string;
  motivation_note: string | null;
  status: HabitStatus;
  started_on: string | null;
  completed_on: string | null;
  habit_type: HabitType;
  period: HabitPeriod;
  target_count: number;
  target_duration_minutes: number | null;
  is_active: boolean;
}

// Habit Logging types
export interface HabitLogCreate {
  logged_for_date?: string | null; // ISO date string, defaults to today
  status: LogStatus;
  started_at?: string | null; // ISO datetime string
  ended_at?: string | null; // ISO datetime string
  duration_minutes?: number | null;
}

export interface HabitLogUpdate {
  status?: LogStatus;
  started_at?: string | null;
  ended_at?: string | null;
  duration_minutes?: number | null;
}

export interface HabitLogResponse {
  log_id: number;
  habit_id: number;
  user_id: number;
  logged_for_date: string; // ISO date string
  status: LogStatus;
  started_at: string | null;
  ended_at: string | null;
  duration_minutes: number | null;
  score_earned: number;
  created_at: string; // ISO datetime string
}

export interface HabitStreakResponse {
  habit_id: number;
  current_streak: number;
  longest_streak: number;
  last_completed_date: string | null; // ISO date string
  updated_at: string; // ISO datetime string
}

// Today's habits types
export interface TodayHabitItem {
  habit_id: number;
  name: string;
  habit_type: HabitType;
  target_count: number;
  target_duration_minutes: number | null;
  is_completed: boolean;
  log_status: LogStatus | null;
  current_streak: number;
}

export interface TodayHabitsResponse {
  date: string; // ISO date string
  total_habits: number;
  completed_count: number;
  habits: TodayHabitItem[];
}
