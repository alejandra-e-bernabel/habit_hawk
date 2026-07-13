import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import useGetAllHabits from "@/hooks/habits/useGetAllHabits";
import { HabitStatus } from "@/types/habits";

const MyGoalsPreview = () => {
  const router = useRouter();
  const { habits, loading, error } = useGetAllHabits();

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>My Goals</Text>
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
          <Text style={styles.title}>My Goals</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load goals</Text>
        </View>
      </View>
    );
  }

  // Filter active and archived habits
  const activeHabits = habits.filter(
    (habit) => habit.status !== HabitStatus.ARCHIVED && habit.is_active
  );
  const hasArchivedHabits = habits.some(
    (habit) => habit.status === HabitStatus.ARCHIVED || !habit.is_active
  );

  const getStatusIcon = (status: HabitStatus) => {
    switch (status) {
      case HabitStatus.COMPLETED:
        return { name: "checkmark-circle" as const, color: "#51CF66" };
      case HabitStatus.IN_PROGRESS:
        return { name: "time" as const, color: "#4F5FD6" };
      case HabitStatus.PAUSED:
        return { name: "pause-circle" as const, color: "#FFA94D" };
      default:
        return { name: "ellipse-outline" as const, color: "#999" };
    }
  };

  const getStatusLabel = (status: HabitStatus) => {
    switch (status) {
      case HabitStatus.COMPLETED:
        return "Completed";
      case HabitStatus.IN_PROGRESS:
        return "Active";
      case HabitStatus.PAUSED:
        return "Paused";
      default:
        return "";
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Goals</Text>
        {hasArchivedHabits && (
          <TouchableOpacity
            style={styles.pastGoalsButton}
            onPress={() => router.push("/(tabs)/habits")}
          >
            <Text style={styles.pastGoalsText}>Past Goals</Text>
            <Ionicons name="chevron-forward" size={16} color="#4F5FD6" />
          </TouchableOpacity>
        )}
      </View>

      {activeHabits.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="flag-outline" size={48} color="#999" />
          <Text style={styles.emptyText}>No active goals yet</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push("/(tabs)/habits")}
          >
            <Ionicons name="add-circle" size={20} color="#fff" />
            <Text style={styles.createButtonText}>Create Goal</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={activeHabits}
            keyExtractor={(item) => item.habit_id.toString()}
            renderItem={({ item }) => {
              const statusIcon = getStatusIcon(item.status);
              const statusLabel = getStatusLabel(item.status);

              return (
                <TouchableOpacity
                  style={styles.goalCard}
                  onPress={() => router.push(`/(tabs)/habits/${item.habit_id}`)}
                >
                  <View style={styles.goalCardLeft}>
                    <Ionicons
                      name={statusIcon.name}
                      size={24}
                      color={statusIcon.color}
                    />
                    <View style={styles.goalInfo}>
                      <Text style={styles.goalName} numberOfLines={1}>
                        {item.name}
                      </Text>
                      {item.motivation_note && (
                        <Text style={styles.goalMotivation} numberOfLines={1}>
                          {item.motivation_note}
                        </Text>
                      )}
                      <View style={styles.goalMeta}>
                        <Text style={styles.goalMetaText}>{statusLabel}</Text>
                        <Text style={styles.goalMetaDot}>•</Text>
                        <Text style={styles.goalMetaText}>
                          {item.target_count}x {item.period}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#999" />
                </TouchableOpacity>
              );
            }}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />

          <TouchableOpacity
            style={styles.createGoalCard}
            onPress={() => router.push("/(tabs)/habits")}
          >
            <Ionicons name="add-circle-outline" size={32} color="#4F5FD6" />
            <Text style={styles.createGoalText}>Create Goal</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  pastGoalsButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  pastGoalsText: {
    fontSize: 14,
    color: "#4F5FD6",
    marginRight: 4,
    fontWeight: "600",
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
    color: "#FF6B6B",
    fontSize: 14,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginTop: 12,
    marginBottom: 16,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4F5FD6",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  goalCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  goalCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  goalInfo: {
    marginLeft: 12,
    flex: 1,
  },
  goalName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  goalMotivation: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  goalMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  goalMetaText: {
    fontSize: 12,
    color: "#999",
  },
  goalMetaDot: {
    fontSize: 12,
    color: "#999",
    marginHorizontal: 6,
  },
  separator: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginVertical: 8,
  },
  createGoalCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    marginTop: 8,
    borderWidth: 2,
    borderColor: "#E0E4FF",
    borderStyle: "dashed",
    borderRadius: 12,
  },
  createGoalText: {
    fontSize: 16,
    color: "#4F5FD6",
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default MyGoalsPreview;
