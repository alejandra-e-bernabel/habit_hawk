import { useState, useEffect, useCallback } from "react";
import { getHabit as getHabitService } from "@/services/HabitServices";
import type { HabitResponse } from "@/types/habits";

const useGetHabit = (habitId: number) => {
  const [habit, setHabit] = useState<HabitResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHabit = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getHabitService(habitId);
      setHabit(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch habit");
    } finally {
      setLoading(false);
    }
  }, [habitId]);

  useEffect(() => {
    fetchHabit();
  }, [fetchHabit]);

  return { habit, loading, error, refetch: fetchHabit };
};

export default useGetHabit;
