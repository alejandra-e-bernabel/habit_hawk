/**
 * Habit types matching backend Pydantic schemas (habit_hawk_backend/habit/schemas.py)
 */

export type HabitType = "reminder" | "log";
export type HabitPeriod = "daily" | "weekly" | "monthly";
export type HabitStatus = "in_progress" | "completed" | "archived" | "paused";

/** Mirrors HabitCreate */
export interface HabitCreate {
  name: string;
  motivation_note?: string | null;
  habit_type?: HabitType;
  period?: HabitPeriod;
  target_count?: number;
  target_duration_minutes?: number | null;
  started_on?: string | null;
  schedule_days?: number[] | null;
}

/** Mirrors HabitResponse */
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
