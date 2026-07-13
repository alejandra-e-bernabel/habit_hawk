/**
 * Leaderboard service for weekly stats and rankings
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiFetch } from "./api";
import type {
  LeaderboardResponse,
  UserWeeklyStats,
} from "@/types/leaderboard";

const TOKEN_KEY = "@habit_hawk_token";

/**
 * Get stored authentication token
 */
async function getToken(): Promise<string | null> {
  return await AsyncStorage.getItem(TOKEN_KEY);
}

/**
 * Get the weekly leaderboard (current user + friends)
 */
export async function getWeeklyLeaderboard(): Promise<LeaderboardResponse> {
  const token = await getToken();

  return await apiFetch<LeaderboardResponse>("/leaderboard/weekly", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Get the current user's weekly statistics
 */
export async function getWeeklyStats(): Promise<UserWeeklyStats> {
  const token = await getToken();

  return await apiFetch<UserWeeklyStats>("/leaderboard/weekly/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
