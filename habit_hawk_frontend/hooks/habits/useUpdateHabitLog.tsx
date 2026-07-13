import { useState } from "react";
import { updateHabitLog as updateHabitLogService } from "@/services/HabitServices";
import type { HabitLogUpdate, HabitLogResponse } from "@/types/habits";

const useUpdateHabitLog = () => {
  const [log, setLog] = useState<HabitLogResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateLog = async (
    habitId: number,
    date: string,
    data: HabitLogUpdate
  ): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const updatedLog = await updateHabitLogService(habitId, date, data);
      setLog(updatedLog);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update log");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateLog, log, loading, error };
};

export default useUpdateHabitLog;
