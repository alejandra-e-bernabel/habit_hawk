import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";
import useGetTodaysHabits from "@/hooks/habits/useGetTodaysHabits";
import { HabitPeriod } from "@/types/habits";

const TodayGoals = () => {
  const router = useRouter();
  const { todaysHabits, loading, error } = useGetTodaysHabits();

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Today&apos;s Goals</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Today&apos;s Goals</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load today&apos;s goals</Text>
        </View>
      </View>
    );
  }

  const habits = todaysHabits?.habits || [];
  const completedCount = todaysHabits?.completed_count || 0;
  const totalHabits = todaysHabits?.total_habits || 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Today&apos;s Goals</Text>
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => router.push("/(tabs)/habits")}
        >
          <Text style={styles.viewAllText}>View All</Text>
          <Ionicons name="chevron-forward-outline" size={16} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {habits.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="checkbox-outline" size={48} color={Colors.textSecondary} />
          <Text style={styles.emptyText}>No goals for today</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push("/(tabs)/habits")}
          >
            <Ionicons name="add-circle-outline" size={20} color={Colors.primary} />
            <Text style={styles.createButtonText}>Create Your First Goal</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.progressBar}>
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${totalHabits > 0 ? (completedCount / totalHabits) * 100 : 0}%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {completedCount} of {totalHabits} completed
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {[...habits].sort((a, b) => {
              if (a.is_period_goal_met === b.is_period_goal_met) return 0;
              return a.is_period_goal_met ? 1 : -1;
            }).map((habit) => (
              <TouchableOpacity
                key={habit.habit_id}
                style={[
                  styles.goalCard,
                  habit.is_period_goal_met && styles.goalCardCompleted,
                ]}
                onPress={() => router.push(`/(tabs)/habits/${habit.habit_id}`)}
              >
                <View style={styles.goalCardHeader}>
                  {habit.is_period_goal_met ? (
                    <Ionicons name="checkmark-circle-outline" size={24} color={Colors.success} />
                  ) : (
                    <Ionicons
                      name="ellipse-outline"
                      size={24}
                      color={Colors.textSecondary}
                    />
                  )}
                  {habit.current_streak > 0 && (
                    <View style={styles.streakBadge}>
                      <Ionicons name="flame-outline" size={14} color={Colors.error} />
                      <Text style={styles.streakText}>{habit.current_streak}</Text>
                    </View>
                  )}
                </View>
                <Text
                  style={[
                    styles.goalName,
                    habit.is_period_goal_met && styles.goalNameCompleted,
                  ]}
                  numberOfLines={2}
                >
                  {habit.name}
                </Text>
                {habit.period === HabitPeriod.WEEKLY && (
                  <Text style={styles.goalDetail}>
                    {habit.weekly_completed_count || 0} of {habit.target_count} this week
                  </Text>
                )}
                {habit.period === HabitPeriod.MONTHLY && (
                  <Text style={styles.goalDetail}>
                    {habit.monthly_completed ? "Completed this month" : `Due in ${habit.monthly_days_until_due || 0}d`}
                  </Text>
                )}
                {habit.period === HabitPeriod.DAILY && habit.target_duration_minutes && (
                  <Text style={styles.goalDetail}>
                    {habit.target_duration_minutes} min
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.white,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.white,
    marginRight: 4,
    opacity: 0.9,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  errorContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  errorText: {
    color: Colors.white,
    fontSize: 14,
    opacity: 0.8,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyText: {
    color: Colors.white,
    fontSize: 16,
    marginTop: 12,
    marginBottom: 16,
    opacity: 0.8,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  createButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  progressBar: {
    marginBottom: 16,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: Colors.success,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: Colors.white,
    opacity: 0.9,
  },
  scrollContent: {
    paddingRight: 16,
  },
  goalCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 160,
    minHeight: 120,
  },
  goalCardCompleted: {
    opacity: 0.7,
  },
  goalCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF5F5",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  streakText: {
    fontSize: 12,
    color: Colors.error,
    fontWeight: "600",
    marginLeft: 2,
  },
  goalName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  goalNameCompleted: {
    textDecorationLine: "line-through",
    color: Colors.textSecondary,
  },
  goalDetail: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});

export default TodayGoals;
