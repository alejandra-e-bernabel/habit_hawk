import { useState, useEffect, useCallback } from "react";
import { getWeeklyStats as getWeeklyStatsService } from "@/services/LeaderboardServices";
import type { UserWeeklyStats } from "@/types/leaderboard";

const useGetWeeklyStats = () => {
  const [weeklyStats, setWeeklyStats] = useState<UserWeeklyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeeklyStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getWeeklyStatsService();
      setWeeklyStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch weekly stats");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeeklyStats();
  }, [fetchWeeklyStats]);

  return { weeklyStats, loading, error, refetch: fetchWeeklyStats };
};

export default useGetWeeklyStats;