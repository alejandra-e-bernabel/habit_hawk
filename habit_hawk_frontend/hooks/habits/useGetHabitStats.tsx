import { useState, useEffect, useCallback } from "react";
import { getHabitStats as getHabitStatsService } from "@/services/HabitServices";
import type { HabitStatsResponse } from "@/types/habits";

const useGetHabitStats = (habitId: number) => {
  const [stats, setStats] = useState<HabitStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getHabitStatsService(habitId);
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch habit stats");
    } finally {
      setLoading(false);
    }
  }, [habitId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
};

export default useGetHabitStats;
