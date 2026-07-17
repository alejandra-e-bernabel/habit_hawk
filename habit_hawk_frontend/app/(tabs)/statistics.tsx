import React, { useState } from "react";

import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import useGetTodaysHabits from "@/hooks/habits/useGetTodaysHabits";
import useGetWeeklyStats from "@/hooks/leaderboard/useGetWeeklyStats";

export default function Statistics() {
  const [refreshKey, setRefreshKey] = useState(0);
  const { todaysHabits, loading: todaysLoading } = useGetTodaysHabits();
  const { weeklyStats, loading: weeklyLoading } = useGetWeeklyStats();

  useFocusEffect(
    React.useCallback(() => {
      setRefreshKey((current) => current + 1);
    }, [])
  );

  const habits = todaysHabits?.habits ?? [];
  const currentStreak = habits.reduce((max, habit) => Math.max(max, habit.current_streak), 0);
  const completedCount = todaysHabits?.completed_count ?? 0;
  const totalHabits = todaysHabits?.total_habits ?? 0;
  const completionRate = totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 0;
  const totalPoints = weeklyStats?.total_score ?? 0;

  return (
    <ScrollView key={refreshKey} style={styles.container}>
      <View style={styles.content}>
        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <Ionicons name="flame" size={24} color="#FF6B6B" />
            <Text style={styles.statTitle}>Current Streak</Text>
          </View>
          <Text style={styles.statValue}>{todaysLoading ? "-" : `${currentStreak} days`}</Text>
          <Text style={styles.statSubtext}>
            {currentStreak > 0 ? "Keep going!" : "Start with today."}
          </Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <Ionicons name="checkmark-done" size={24} color="#51CF66" />
            <Text style={styles.statTitle}>Habits Completed</Text>
          </View>
          <Text style={styles.statValue}>{todaysLoading ? "-" : completedCount}</Text>
          <Text style={styles.statSubtext}>Today</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <Ionicons name="trending-up" size={24} color="#4DABF7" />
            <Text style={styles.statTitle}>Completion Rate</Text>
          </View>
          <Text style={styles.statValue}>{todaysLoading ? "-" : `${completionRate}%`}</Text>
          <Text style={styles.statSubtext}>Today</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <Ionicons name="star" size={24} color="#FFD43B" />
            <Text style={styles.statTitle}>Total Points</Text>
          </View>
          <Text style={styles.statValue}>{weeklyLoading ? "-" : totalPoints}</Text>
          <Text style={styles.statSubtext}>This week</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Progress</Text>
          <Text style={styles.placeholder}>Chart showing weekly progress will appear here</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Habit Breakdown</Text>
          <Text style={styles.placeholder}>Individual habit statistics will appear here</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    padding: 16,
  },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
  },
  statHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  statTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
    marginLeft: 8,
  },
  statValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  statSubtext: {
    fontSize: 14,
    color: "#999",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginTop: 4,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  placeholder: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
  },
});
