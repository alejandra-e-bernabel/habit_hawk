import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "@/constants/Colors";

export interface DayProgress {
  day: string; // "Mon", "Tue", etc.
  count: number;
  isToday: boolean;
  isFuture: boolean;
}

interface WeeklyProgressChartProps {
  data: DayProgress[];
  completedCount: number;
  frozenCount: number;
}

export default function WeeklyProgressChart({
  data,
  completedCount,
  frozenCount,
}: WeeklyProgressChartProps) {
  // Find max value for scaling bars
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Weekly progress</Text>
        <Text style={styles.subtitle}>
          {completedCount} done · {frozenCount} frozen
        </Text>
      </View>

      <View style={styles.chartContainer}>
        {data.map((dayData, index) => {
          const heightPercent = dayData.isFuture ? 0 : (dayData.count / maxCount) * 100;
          const barColor = dayData.isToday
            ? Colors.primary
            : dayData.isFuture
            ? Colors.border
            : "#A5B4FC"; // Soft indigo

          return (
            <View key={index} style={styles.barWrapper}>
              <View style={styles.barContainer}>
                {dayData.isFuture ? (
                  <View style={[styles.barStub, { backgroundColor: barColor }]} />
                ) : (
                  <View
                    style={[
                      styles.bar,
                      {
                        height: `${Math.max(heightPercent, 5)}%`,
                        backgroundColor: barColor,
                      },
                    ]}
                  />
                )}
              </View>
              <Text
                style={[
                  styles.dayLabel,
                  dayData.isToday && styles.dayLabelToday,
                  dayData.isFuture && styles.dayLabelFuture,
                ]}
              >
                {dayData.isFuture ? "—" : dayData.day}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textFaint,
  },
  chartContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 120,
    gap: 8,
  },
  barWrapper: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },
  barContainer: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  bar: {
    width: "100%",
    borderRadius: 4,
    minHeight: 5,
  },
  barStub: {
    width: "100%",
    height: 5,
    borderRadius: 2,
  },
  dayLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: "400",
  },
  dayLabelToday: {
    color: Colors.primary,
    fontWeight: "600",
  },
  dayLabelFuture: {
    color: Colors.textFaint,
  },
});
