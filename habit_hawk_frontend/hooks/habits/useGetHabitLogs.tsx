import { useState, useEffect, useCallback } from "react";
import { getHabitLogs as getHabitLogsService } from "@/services/HabitServices";
import type { HabitLogResponse } from "@/types/habits";

const useGetHabitLogs = (
  habitId: number,
  startDate?: string,
  endDate?: string
) => {
  const [logs, setLogs] = useState<HabitLogResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getHabitLogsService(habitId, startDate, endDate);
      setLogs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch habit logs");
    } finally {
      setLoading(false);
    }
  }, [habitId, startDate, endDate]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return { logs, loading, error, refetch: fetchLogs };
};

export default useGetHabitLogs;
