import React from "react";

import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useFocusEffect, router, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import useGetHabit from "@/hooks/habits/useGetHabit";

export default function HabitDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const habitId = Number(id);
  const { habit, loading, error, refetch } = useGetHabit(habitId);

  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [refetch])
  );

  if (loading) {
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

          {/* History */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>History</Text>
            <Text style={styles.placeholder}>Completion history will appear here</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.completeButton}>
              <Ionicons name="checkmark-circle" size={24} color="#fff" />
              <Text style={styles.completeButtonText}>Mark Complete</Text>
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
