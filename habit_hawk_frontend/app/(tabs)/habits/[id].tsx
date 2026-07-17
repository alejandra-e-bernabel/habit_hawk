import React from "react";

import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams, useFocusEffect, router, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import useGetHabit from "@/hooks/habits/useGetHabit";
import useGetTodaysHabits from "@/hooks/habits/useGetTodaysHabits";
import useLogHabit from "@/hooks/habits/useLogHabit";
import useUpdateHabitLog from "@/hooks/habits/useUpdateHabitLog";
import useGetFreezeInventory from "@/hooks/freezes/useGetFreezeInventory";
import useGetFreezeProgress from "@/hooks/freezes/useGetFreezeProgress";
import useApplyFreeze from "@/hooks/freezes/useApplyFreeze";
import { FreezeStatus } from "@/types/freezes";
import { LogStatus } from "@/types/habits";

export default function HabitDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const habitId = Number(id);
  const { habit, loading, error, refetch } = useGetHabit(habitId);
  const { todaysHabits, refetch: refetchTodaysHabits } = useGetTodaysHabits();
  const { logHabit, loading: loggingHabit } = useLogHabit();
  const { updateLog, loading: updatingHabitLog } = useUpdateHabitLog();
  const {
    inventory,
    loading: freezeInventoryLoading,
    refetch: refetchInventory,
  } = useGetFreezeInventory();
  const {
    progress,
    loading: freezeProgressLoading,
    refetch: refetchProgress,
  } = useGetFreezeProgress();
  const { applyFreeze, loading: applyingFreeze } = useApplyFreeze();

  const currentFreezeProgress = progress.find((item) => item.habit_id === habitId);
  const availableFreezes = inventory?.freezes.filter(
    (freeze) => freeze.status === FreezeStatus.AVAILABLE
  ) ?? [];
  const today = todaysHabits?.date;
  const todayHabit = todaysHabits?.habits.find((item) => item.habit_id === habitId);
  const isTodayActionTaken = todayHabit?.log_status !== null;
  const isMarkedComplete = todayHabit?.is_completed ?? false;
  const isCompleteButtonDisabled = isTodayActionTaken || loggingHabit || updatingHabitLog;
  const isFreezeButtonDisabled = isTodayActionTaken || availableFreezes.length === 0 || applyingFreeze;

  useFocusEffect(
    React.useCallback(() => {
      refetch();
      refetchTodaysHabits();
      refetchInventory();
      refetchProgress();
    }, [refetch, refetchTodaysHabits, refetchInventory, refetchProgress])
  );

  const handleMarkComplete = async () => {
    if (!habit) {
      return;
    }

    try {
      if (todayHabit?.log_status && today) {
        await updateLog(habit.habit_id, today, { status: LogStatus.COMPLETED });
      } else {
        await logHabit(habit.habit_id, {
          status: LogStatus.COMPLETED,
          logged_for_date: today || undefined,
        });
      }

      await Promise.all([refetch(), refetchTodaysHabits(), refetchInventory(), refetchProgress()]);
      Alert.alert("Habit Updated", "Marked complete successfully.");
    } catch (err) {
      Alert.alert(
        "Couldn\'t Mark Complete",
        err instanceof Error ? err.message : "Please try again"
      );
    }
  };

  const handleApplyFreeze = async () => {
    const availableFreeze = availableFreezes[0];

    if (!habit) {
      return;
    }

    if (!availableFreeze) {
      Alert.alert(
        "No Freeze Available",
        "Keep your streak going to earn a freeze first."
      );
      return;
    }

    try {
      await applyFreeze(availableFreeze.freeze_id, { habit_id: habit.habit_id });
      await Promise.all([refetch(), refetchInventory(), refetchProgress()]);
      Alert.alert("Freeze Applied", "Your streak freeze has been applied.");
    } catch (err) {
      Alert.alert(
        "Couldn\'t Apply Freeze",
        err instanceof Error ? err.message : "Please try again"
      );
    }
  };

  if (loading || freezeInventoryLoading || freezeProgressLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error || !habit) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={64} color="#ccc" />
        <Text style={styles.emptyTitle}>Couldn&apos;t Load Habit</Text>
        <Text style={styles.emptyText}>{error || "Habit not found"}</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: habit.name,
          headerBackTitle: "Habits",
        }}
      />
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          {/* Habit Info */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Motivation</Text>
            <Text style={styles.motivationText}>
              {habit.motivation_note || "No motivation set"}
            </Text>
          </View>

          {/* Goal */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Goal</Text>
            <Text style={styles.goalText}>
              {habit.target_count} time{habit.target_count > 1 ? "s" : ""} {habit.period}
            </Text>
          </View>

          {/* Streak Freeze */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Streak Freeze</Text>
            <Text style={styles.freezeText}>
              {currentFreezeProgress
                ? `${currentFreezeProgress.days_until_next_freeze} more check-ins to earn your next freeze.`
                : "Keep completing this habit to earn streak freezes."}
            </Text>
            <Text style={styles.freezeSubtext}>
              {currentFreezeProgress
                ? `${currentFreezeProgress.freezes_earned_count} freezes earned from this habit.`
                : ""}
            </Text>

            <Text style={styles.freezeCountText}>
              {inventory?.available_count || 0} available freeze{(inventory?.available_count || 0) === 1 ? "" : "s"}
            </Text>
          </View>

          {/* History */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>History</Text>
            <Text style={styles.placeholder}>Completion history will appear here</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[
                styles.completeButton,
                isMarkedComplete && styles.completeButtonCompleted,
                isCompleteButtonDisabled && styles.buttonDisabled,
              ]}
              onPress={handleMarkComplete}
              disabled={isCompleteButtonDisabled}
            >
              {loggingHabit || updatingHabitLog ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={isMarkedComplete ? "#666" : "#fff"}
                  />
                  <Text
                    style={[
                      styles.completeButtonText,
                      isMarkedComplete && styles.completeButtonTextDisabled,
                    ]}
                  >
                    {isMarkedComplete ? "Completed" : "Mark Complete"}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.freezeButton,
                isTodayActionTaken && styles.freezeButtonCompleted,
                isFreezeButtonDisabled && styles.freezeButtonDisabled,
              ]}
              onPress={handleApplyFreeze}
              disabled={isFreezeButtonDisabled}
            >
              {applyingFreeze ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons
                    name="snow"
                    size={18}
                    color={isTodayActionTaken ? "#666" : "#fff"}
                  />
                  <Text style={styles.freezeButtonText}>Apply Streak Freeze</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.editButton}
              onPress={() => router.push(`/edit-habit?id=${habit.habit_id}`)}
            >
              <Ionicons name="create-outline" size={24} color="#007AFF" />
              <Text style={styles.editButtonText}>Edit Habit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    backgroundColor: "#f5f5f5",
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  motivationText: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
  },
  goalText: {
    fontSize: 16,
    color: "#666",
  },
  freezeText: {
    fontSize: 16,
    color: "#666",
    lineHeight: 22,
    marginBottom: 6,
  },
  freezeSubtext: {
    fontSize: 13,
    color: "#999",
    marginBottom: 14,
  },
  freezeButton: {
    backgroundColor: "#4F5FD6",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  freezeButtonDisabled: {
    opacity: 0.5,
  },
  freezeButtonCompleted: {
    backgroundColor: "#D9D9D9",
  },
  freezeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },
  freezeCountText: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
  },
  placeholder: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  actionButtons: {
    marginTop: 8,
    marginBottom: 32,
  },
  completeButton: {
    backgroundColor: "#51CF66",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  completeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  completeButtonCompleted: {
    backgroundColor: "#D9D9D9",
  },
  completeButtonTextDisabled: {
    color: "#666",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  editButton: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  editButtonText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
