import { useState, useEffect, useCallback } from "react";
import {
  getStatisticsOverview,
  getWeeklyProgress,
  getHabitBreakdown,
} from "@/services/HabitServices";
import type {
  StatisticsOverviewResponse,
  WeeklyProgressResponse,
  HabitBreakdownResponse,
  StatisticsRange,
} from "@/types/habits";

interface StatisticsData {
  overview: StatisticsOverviewResponse | null;
  weeklyProgress: WeeklyProgressResponse | null;
  habitBreakdown: HabitBreakdownResponse | null;
}

const useStatisticsData = (range: StatisticsRange) => {
  const [data, setData] = useState<StatisticsData>({
    overview: null,
    weeklyProgress: null,
    habitBreakdown: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [overviewData, weeklyData, breakdownData] = await Promise.all([
        getStatisticsOverview(range),
        getWeeklyProgress(),
        getHabitBreakdown(range),
      ]);

      setData({
        overview: overviewData,
        weeklyProgress: weeklyData,
        habitBreakdown: breakdownData,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch statistics");
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  return { data, loading, error, refetch: fetchStatistics };
};

export default useStatisticsData;
