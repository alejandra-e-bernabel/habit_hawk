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
  icon_name?: string | null;
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
  icon_name?: string | null;
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
  icon_name: string | null;
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
  note?: string | null; // Optional journal note
  session_rating?: number | null; // Optional 1-5 star rating
}

export interface HabitLogUpdate {
  status?: LogStatus;
  started_at?: string | null;
  ended_at?: string | null;
  duration_minutes?: number | null;
  note?: string | null;
  session_rating?: number | null;
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
  note: string | null;
  session_rating: number | null;
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
  period: HabitPeriod; // Daily, weekly, or monthly
  target_count: number;
  target_duration_minutes: number | null;
  is_completed: boolean; // Whether completed TODAY (for daily habits)
  is_period_goal_met: boolean; // Whether period goal is met (daily: same as is_completed, weekly: count >= target, monthly: monthly_completed)
  log_status: LogStatus | null;
  current_streak: number;

  // Weekly progress (for weekly habits only)
  weekly_completed_count?: number | null;

  // Monthly progress (for monthly habits only)
  monthly_completed?: boolean | null;
  monthly_days_until_due?: number | null;
}

export interface TodayHabitsResponse {
  date: string; // ISO date string
  total_habits: number;
  completed_count: number;
  habits: TodayHabitItem[];
}

// Habit Statistics types
export interface HabitStatsResponse {
  habit_id: number;
  total_sessions: number;
  completion_rate_7days: number; // % completed in last 7 days
  completion_rate_30days: number; // % completed in last 30 days
  completion_rate_all_time: number; // % completed overall
  average_session_duration: number | null; // minutes, only for log-type
  total_duration_minutes: number | null; // total time logged
  average_rating: number | null; // average of session ratings
  notes_count: number; // number of sessions with notes
  current_streak: number;
  longest_streak: number;
  last_completed_date: string | null; // ISO date string
}

// Statistics Page Types
export type StatisticsRange = "week" | "month" | "all_time";

export interface StatisticsOverviewResponse {
  range: StatisticsRange;
  // Current streak (always live, not range-dependent)
  current_streak: number;
  longest_streak: number;
  // Range-dependent metrics
  total_points: number; // SUM(HabitLog.score_earned)
  completion_rate: number; // completed_count / due_count
  completed_count: number; // COUNT(HabitLog WHERE status = completed)
}

export interface WeeklyProgressDay {
  date: string; // ISO date
  day_name: string; // "Mon", "Tue", etc.
  completed_count: number;
  frozen_count: number;
  is_today: boolean;
}

export interface WeeklyProgressResponse {
  week_start: string; // ISO date (Monday)
  week_end: string; // ISO date (Sunday)
  days: WeeklyProgressDay[];
  total_completed: number;
  total_frozen: number;
}

export interface HabitBreakdownItem {
  habit_id: number;
  name: string;
  icon_name: string | null;
  completed_count: number;
  due_count: number;
  completion_rate: number; // completed_count / due_count
}

export interface HabitBreakdownResponse {
  range: StatisticsRange;
  habits: HabitBreakdownItem[];
}
