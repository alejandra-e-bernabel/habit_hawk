import { useState } from "react";
import { createHabit as createHabitService } from "@/services/HabitServices";
import type { HabitCreate, HabitResponse } from "@/types/habits";

const useCreateHabit = () => {
  const [habit, setHabit] = useState<HabitResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createHabit = async (data: HabitCreate): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const newHabit = await createHabitService(data);
      setHabit(newHabit);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create habit");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createHabit, habit, loading, error };
};

export default useCreateHabit;
