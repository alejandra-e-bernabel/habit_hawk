import { useState } from "react";
import { deleteHabit as deleteHabitService } from "@/services/HabitServices";

const useDeleteHabit = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteHabit = async (habitId: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await deleteHabitService(habitId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete habit");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { deleteHabit, loading, error };
};

export default useDeleteHabit;
