/**
 * Habit service for CRUD operations and logging
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiFetch } from "./api";
import type {
  HabitCreate,
  HabitUpdate,
  HabitResponse,
  HabitLogCreate,
  HabitLogUpdate,
  HabitLogResponse,
  TodayHabitsResponse,
} from "@/types/habits";

const TOKEN_KEY = "@habit_hawk_token";

/**
 * Get stored authentication token
 */
async function getToken(): Promise<string | null> {
  return await AsyncStorage.getItem(TOKEN_KEY);
}

// ==============================
// Habit CRUD Operations
// ==============================

/**
 * Create a new habit
 */
export async function createHabit(data: HabitCreate): Promise<HabitResponse> {
  const token = await getToken();

  return await apiFetch<HabitResponse>("/habits", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
}

/**
 * Get a single habit by ID
 */
export async function getHabit(habitId: number): Promise<HabitResponse> {
  const token = await getToken();

  return await apiFetch<HabitResponse>(`/habits/${habitId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Update an existing habit
 */
export async function updateHabit(
  habitId: number,
  data: HabitUpdate
): Promise<HabitResponse> {
  const token = await getToken();

  return await apiFetch<HabitResponse>(`/habits/${habitId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
}

/**
 * Delete a habit
 */
export async function deleteHabit(
  habitId: number
): Promise<{ message: string }> {
  const token = await getToken();

  return await apiFetch<{ message: string }>(`/habits/${habitId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// ==============================
// Habit Logging Operations
// ==============================

/**
 * Log a habit (complete, incomplete, skip)
 */
export async function logHabit(
  habitId: number,
  data: HabitLogCreate
): Promise<HabitLogResponse> {
  const token = await getToken();

  return await apiFetch<HabitLogResponse>(`/habits/${habitId}/logs`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
}

/**
 * Update an existing habit log
 */
export async function updateHabitLog(
  habitId: number,
  date: string,
  data: HabitLogUpdate
): Promise<HabitLogResponse> {
  const token = await getToken();

  return await apiFetch<HabitLogResponse>(`/habits/${habitId}/logs/${date}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
}

/**
 * Get logs for a habit with optional date range filters
 */
export async function getHabitLogs(
  habitId: number,
  startDate?: string,
  endDate?: string
): Promise<HabitLogResponse[]> {
  const token = await getToken();

  // Build query params
  const params = new URLSearchParams();
  if (startDate) params.append("start_date", startDate);
  if (endDate) params.append("end_date", endDate);

  const queryString = params.toString();
  const endpoint = `/habits/${habitId}/logs${queryString ? `?${queryString}` : ""}`;

  return await apiFetch<HabitLogResponse[]>(endpoint, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Delete a habit log
 */
export async function deleteHabitLog(
  habitId: number,
  date: string
): Promise<{ message: string }> {
  const token = await getToken();

  return await apiFetch<{ message: string }>(`/habits/${habitId}/logs/${date}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Get all habits for the user
 */
export async function getAllHabits(): Promise<HabitResponse[]> {
  const token = await getToken();

  return await apiFetch<HabitResponse[]>("/habits", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Get today's habits with completion status
 */
export async function getTodaysHabits(): Promise<TodayHabitsResponse> {
  const token = await getToken();

  return await apiFetch<TodayHabitsResponse>("/habits/today", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
