import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useFocusEffect } from "expo-router";
import { Colors } from "@/constants/Colors";
import SegmentedControl from "@/components/SegmentedControl";
import StatMetricTile from "@/components/StatMetricTile";
import WeeklyProgressChart from "@/components/WeeklyProgressChart";
import HabitBreakdownRow from "@/components/HabitBreakdownRow";
import useStatisticsData from "@/hooks/habits/useStatisticsData";
import type { StatisticsRange } from "@/types/habits";
import type { DayProgress } from "@/components/WeeklyProgressChart";

const RANGE_OPTIONS = [
  { label: "Week", value: "week" as const },
  { label: "Month", value: "month" as const },
  { label: "All time", value: "all_time" as const },
];

export default function Statistics() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedRange, setSelectedRange] = useState<StatisticsRange>("week");
  const { data, loading, refetch } = useStatisticsData(selectedRange);

  useFocusEffect(
    React.useCallback(() => {
      setRefreshKey((current) => current + 1);
      refetch();
    }, [refetch])
  );

  const { overview, weeklyProgress, habitBreakdown } = data;

  // Transform weekly progress data for the chart
  const chartData: DayProgress[] =
    weeklyProgress?.days.map((day) => {
      const dayDate = new Date(day.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      dayDate.setHours(0, 0, 0, 0);
      const isFuture = dayDate > today;

      return {
        day: day.day_name,
        count: day.completed_count,
        isToday: day.is_today,
        isFuture,
      };
    }) ?? [];

  // Debug logging
  console.log("Weekly Progress Data:", weeklyProgress);
  console.log("Chart Data:", chartData);

  return (
    <ScrollView key={refreshKey} style={styles.container}>
      <View style={styles.content}>
        {/* Range Selector */}
        <View style={styles.rangeSelector}>
          <SegmentedControl
            options={RANGE_OPTIONS}
            value={selectedRange}
            onChange={(value) => setSelectedRange(value)}
          />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <>
            {/* Metric Grid - 2x2 */}
            <View style={styles.metricGrid}>
              <StatMetricTile
                icon="flame-outline"
                iconColor={Colors.accentText}
                label="Current streak"
                value={overview?.current_streak ?? 0}
                subLabel={`Best: ${overview?.longest_streak ?? 0}`}
              />
              <StatMetricTile
                icon="star-outline"
                iconColor={Colors.primary}
                label="Points"
                value={overview?.total_points ?? 0}
              />
              <StatMetricTile
                icon="trending-up-outline"
                iconColor={Colors.primary}
                label="Completion"
                value={`${Math.round(overview?.completion_rate ?? 0)}%`}
              />
              <StatMetricTile
                icon="checkmark-circle-outline"
                iconColor={Colors.primary}
                label="Completed"
                value={overview?.completed_count ?? 0}
              />
            </View>

            {/* Weekly Progress Chart */}
            {weeklyProgress && chartData.length > 0 ? (
              <WeeklyProgressChart
                data={chartData}
                completedCount={weeklyProgress.total_completed}
                frozenCount={weeklyProgress.total_frozen}
              />
            ) : (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Weekly progress</Text>
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>
                    Chart will appear when you start logging habits
                  </Text>
                </View>
              </View>
            )}

            {/* Habit Breakdown */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Habit breakdown</Text>
              {habitBreakdown && habitBreakdown.habits.length > 0 ? (
                <View style={styles.breakdownList}>
                  {habitBreakdown.habits.map((habit) => (
                    <HabitBreakdownRow
                      key={habit.habit_id}
                      iconName={habit.icon_name}
                      habitName={habit.name}
                      completedCount={habit.completed_count}
                      totalDue={habit.due_count}
                    />
                  ))}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>
                    Individual habit statistics will appear here
                  </Text>
                </View>
              )}
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
  },
  rangeSelector: {
    marginBottom: 16,
  },
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  breakdownList: {
    gap: 0,
  },
  emptyState: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: "center",
  },
});
