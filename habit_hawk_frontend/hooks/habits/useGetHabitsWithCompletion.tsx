import { useState, useEffect, useCallback } from "react";
import { getAllHabits, getTodaysHabits } from "@/services/HabitServices";
import type { HabitResponse, TodayHabitItem } from "@/types/habits";

export interface HabitWithCompletion extends HabitResponse {
  is_completed?: boolean;
  is_period_goal_met?: boolean;
  log_status?: string | null;
  current_streak: number;

  // Weekly progress (for weekly habits only)
  weekly_completed_count?: number | null;

  // Monthly progress (for monthly habits only)
  monthly_completed?: boolean | null;
  monthly_days_until_due?: number | null;
}

const useGetHabitsWithCompletion = () => {
  const [habits, setHabits] = useState<HabitWithCompletion[]>([]);
  const [todayData, setTodayData] = useState<{
    completed_count: number;
    total_habits: number;
  } | null>(null);
  const [bestStreak, setBestStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch both datasets in parallel
      const [allHabitsData, todaysHabitsData] = await Promise.all([
        getAllHabits(),
        getTodaysHabits(),
      ]);

      // Create a map of today's completion data by habit_id
      const completionMap = new Map<number, TodayHabitItem>();
      let maxStreak = 0;

      todaysHabitsData.habits.forEach((todayHabit) => {
        completionMap.set(todayHabit.habit_id, todayHabit);
        if (todayHabit.current_streak > maxStreak) {
          maxStreak = todayHabit.current_streak;
        }
      });

      // Merge the data: add completion info to all habits
      const mergedHabits: HabitWithCompletion[] = allHabitsData.map((habit) => {
        const todayInfo = completionMap.get(habit.habit_id);
        return {
          ...habit,
          is_completed: todayInfo?.is_completed ?? false,
          is_period_goal_met: todayInfo?.is_period_goal_met ?? false,
          log_status: todayInfo?.log_status ?? null,
          current_streak: todayInfo?.current_streak ?? 0,
          weekly_completed_count: todayInfo?.weekly_completed_count ?? null,
          monthly_completed: todayInfo?.monthly_completed ?? null,
          monthly_days_until_due: todayInfo?.monthly_days_until_due ?? null,
        };
      });

      setHabits(mergedHabits);
      setTodayData({
        completed_count: todaysHabitsData.completed_count,
        total_habits: todaysHabitsData.total_habits,
      });
      setBestStreak(maxStreak);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch habits");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    habits,
    todayData,
    bestStreak,
    loading,
    error,
    refetch: fetchData,
  };
};

export default useGetHabitsWithCompletion;
