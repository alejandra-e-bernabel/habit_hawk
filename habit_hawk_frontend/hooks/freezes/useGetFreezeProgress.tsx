import { useCallback, useEffect, useState } from "react";

import { getFreezeProgress as getFreezeProgressService } from "@/services/FreezeServices";
import type { HabitFreezeProgress } from "@/types/freezes";

const useGetFreezeProgress = () => {
  const [progress, setProgress] = useState<HabitFreezeProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFreezeProgress = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getFreezeProgressService();
      setProgress(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch freeze progress");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFreezeProgress();
  }, [fetchFreezeProgress]);

  return { progress, loading, error, refetch: fetchFreezeProgress };
};

export default useGetFreezeProgress;
