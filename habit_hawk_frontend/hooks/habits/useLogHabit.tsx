import { useState } from "react";
import { logHabit as logHabitService } from "@/services/HabitServices";
import type { HabitLogCreate, HabitLogResponse } from "@/types/habits";

const useLogHabit = () => {
  const [log, setLog] = useState<HabitLogResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logHabit = async (habitId: number, data: HabitLogCreate): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const newLog = await logHabitService(habitId, data);
      setLog(newLog);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to log habit");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { logHabit, log, loading, error };
};

export default useLogHabit;
