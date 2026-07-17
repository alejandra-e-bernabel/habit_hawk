/**
 * Freeze types matching backend Pydantic schemas
 */

export enum FreezeStatus {
  AVAILABLE = "available",
  APPLIED = "applied",
  CONSUMED = "consumed",
}

export interface FreezeResponse {
  freeze_id: number;
  user_id: number;
  habit_id: number | null;
  status: FreezeStatus;
  acquired_at: string;
  applied_to_date: string | null;
}

export interface FreezeInventoryResponse {
  total_earned_count: number;
  available_count: number;
  applied_count: number;
  consumed_count: number;
  freezes: FreezeResponse[];
}

export interface HabitFreezeProgress {
  habit_id: number;
  habit_name: string;
  current_streak: number;
  freezes_earned_count: number;
  days_until_next_freeze: number;
}

export interface FreezeApplyRequest {
  habit_id: number;
  applied_to_date?: string | null;
}
