/**
 * Habit service for creating and managing habits
 */

import { apiFetch, ApiError } from "./api";
import { getStoredToken } from "./AuthServices";
import type { HabitCreate, HabitResponse } from "@/types/habit";

/**
 * Create a new habit for the authenticated user
 */
export async function createHabit(
  habitData: HabitCreate
): Promise<HabitResponse> {
  const token = await getStoredToken();

  if (!token) {
    throw new ApiError(401, "No authentication token found");
  }

  const response = await apiFetch<HabitResponse>("/habits", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(habitData),
  });

  return response;
}
