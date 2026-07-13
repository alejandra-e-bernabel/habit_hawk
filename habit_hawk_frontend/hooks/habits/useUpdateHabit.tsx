import { useState } from "react";
import { updateHabit as updateHabitService } from "@/services/HabitServices";
import type { HabitUpdate, HabitResponse } from "@/types/habits";

const useUpdateHabit = () => {
  const [habit, setHabit] = useState<HabitResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateHabit = async (habitId: number, data: HabitUpdate): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const updatedHabit = await updateHabitService(habitId, data);
      setHabit(updatedHabit);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update habit");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateHabit, habit, loading, error };
};

export default useUpdateHabit;
