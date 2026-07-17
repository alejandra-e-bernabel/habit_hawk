import { useState, useEffect, useCallback } from "react";
import { getTodaysHabits as getTodaysHabitsService } from "@/services/HabitServices";
import type { TodayHabitsResponse } from "@/types/habits";

const useGetTodaysHabits = () => {
  const [todaysHabits, setTodaysHabits] = useState<TodayHabitsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTodaysHabits = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTodaysHabitsService();
      setTodaysHabits(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch today's habits");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodaysHabits();
  }, [fetchTodaysHabits]);

  return { todaysHabits, loading, error, refetch: fetchTodaysHabits };
};

export default useGetTodaysHabits;
