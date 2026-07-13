import { useState, useEffect, useCallback } from "react";
import { getWeeklyLeaderboard as getWeeklyLeaderboardService } from "@/services/LeaderboardServices";
import type { LeaderboardResponse } from "@/types/leaderboard";

const useGetWeeklyLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getWeeklyLeaderboardService();
      setLeaderboard(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch weekly leaderboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return { leaderboard, loading, error, refetch: fetchLeaderboard };
};

export default useGetWeeklyLeaderboard;
