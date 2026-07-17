/**
 * Leaderboard types matching backend Pydantic schemas
 */

export interface LeaderboardEntry {
  rank: number;
  user_id: number;
  username: string;
  total_score: number;
  is_current_user: boolean;
}

export interface LeaderboardResponse {
  week_start: string; // ISO date string
  week_end: string; // ISO date string
  entries: LeaderboardEntry[];
  total_users: number;
}

export interface UserWeeklyStats {
  user_id: number;
  username: string;
  total_score: number;
  rank: number | null; // null if user has no score this week
  week_start: string; // ISO date string
  week_end: string; // ISO date string
  friends_count: number; // Number of friends on the leaderboard
}
