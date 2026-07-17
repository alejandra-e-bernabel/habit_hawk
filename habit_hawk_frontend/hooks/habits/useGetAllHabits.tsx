import { useState, useEffect, useCallback } from "react";
import { getAllHabits as getAllHabitsService } from "@/services/HabitServices";
import type { HabitResponse } from "@/types/habits";

const useGetAllHabits = () => {
  const [habits, setHabits] = useState<HabitResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllHabits = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllHabitsService();
      setHabits(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch habits");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllHabits();
  }, [fetchAllHabits]);

  return { habits, loading, error, refetch: fetchAllHabits };
};

export default useGetAllHabits;
