/**
 * Freeze service for reading inventory/progress and applying streak freezes
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiFetch, ApiError } from "./api";
import type {
  FreezeApplyRequest,
  FreezeInventoryResponse,
  FreezeResponse,
  HabitFreezeProgress,
} from "@/types/freezes";

const TOKEN_KEY = "@habit_hawk_token";

async function getToken(): Promise<string | null> {
  return await AsyncStorage.getItem(TOKEN_KEY);
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await getToken();

  if (!token) {
    throw new ApiError(401, "No authentication token found");
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function getFreezeInventory(): Promise<FreezeInventoryResponse> {
  const headers = await getAuthHeaders();

  return await apiFetch<FreezeInventoryResponse>("/freezes", {
    method: "GET",
    headers,
  });
}

export async function getFreezeProgress(): Promise<HabitFreezeProgress[]> {
  const headers = await getAuthHeaders();

  return await apiFetch<HabitFreezeProgress[]>("/freezes/progress", {
    method: "GET",
    headers,
  });
}

export async function applyFreeze(
  freezeId: number,
  data: FreezeApplyRequest
): Promise<FreezeResponse> {
  const headers = await getAuthHeaders();

  return await apiFetch<FreezeResponse>(`/freezes/${freezeId}/apply`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
}
