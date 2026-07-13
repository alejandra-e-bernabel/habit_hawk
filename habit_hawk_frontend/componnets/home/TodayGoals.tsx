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
import useGetTodaysHabits from "@/hooks/habits/useGetTodaysHabits";

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
          <ActivityIndicator size="large" color="#4F5FD6" />
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
          <Ionicons name="chevron-forward" size={16} color="#fff" />
        </TouchableOpacity>
      </View>

      {habits.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="checkbox-outline" size={48} color="#999" />
          <Text style={styles.emptyText}>No goals for today</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push("/(tabs)/habits")}
          >
            <Ionicons name="add-circle" size={20} color="#4F5FD6" />
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
            {habits.map((habit) => (
              <TouchableOpacity
                key={habit.habit_id}
                style={[
                  styles.goalCard,
                  habit.is_completed && styles.goalCardCompleted,
                ]}
                onPress={() => router.push(`/(tabs)/habits/${habit.habit_id}`)}
              >
                <View style={styles.goalCardHeader}>
                  {habit.is_completed ? (
                    <Ionicons name="checkmark-circle" size={24} color="#51CF66" />
                  ) : (
                    <Ionicons
                      name="ellipse-outline"
                      size={24}
                      color="#999"
                    />
                  )}
                  {habit.current_streak > 0 && (
                    <View style={styles.streakBadge}>
                      <Ionicons name="flame" size={14} color="#FF6B6B" />
                      <Text style={styles.streakText}>{habit.current_streak}</Text>
                    </View>
                  )}
                </View>
                <Text
                  style={[
                    styles.goalName,
                    habit.is_completed && styles.goalNameCompleted,
                  ]}
                  numberOfLines={2}
                >
                  {habit.name}
                </Text>
                {habit.target_duration_minutes && (
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
    backgroundColor: "#4F5FD6",
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
    color: "#fff",
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewAllText: {
    fontSize: 14,
    color: "#fff",
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
    color: "#fff",
    fontSize: 14,
    opacity: 0.8,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 12,
    marginBottom: 16,
    opacity: 0.8,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  createButtonText: {
    color: "#4F5FD6",
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
    backgroundColor: "#51CF66",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: "#fff",
    opacity: 0.9,
  },
  scrollContent: {
    paddingRight: 16,
  },
  goalCard: {
    backgroundColor: "#fff",
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
    color: "#FF6B6B",
    fontWeight: "600",
    marginLeft: 2,
  },
  goalName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  goalNameCompleted: {
    textDecorationLine: "line-through",
    color: "#999",
  },
  goalDetail: {
    fontSize: 12,
    color: "#666",
  },
});

export default TodayGoals;
