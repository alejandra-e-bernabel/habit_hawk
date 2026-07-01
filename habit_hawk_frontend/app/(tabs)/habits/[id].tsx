import React from "react";


import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function HabitDetail() {
  const { id } = useLocalSearchParams();

  // Mock data - will be replaced with real data fetched by ID
  const habit = {
    id: id,
    name: "Habit Name",
    motivation: "Why you're doing this habit",
    streak: 0,
    completionRate: 0,
    targetCount: 1,
    period: "daily",
  };

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
              {habit.motivation || "No motivation set"}
            </Text>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Ionicons name="flame" size={32} color="#FF6B6B" />
              <Text style={styles.statValue}>{habit.streak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            <View style={styles.statBox}>
              <Ionicons name="stats-chart" size={32} color="#4DABF7" />
              <Text style={styles.statValue}>{habit.completionRate}%</Text>
              <Text style={styles.statLabel}>Completion</Text>
            </View>
          </View>

          {/* Goal */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Goal</Text>
            <Text style={styles.goalText}>
              {habit.targetCount} time{habit.targetCount > 1 ? "s" : ""} {habit.period}
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

            <TouchableOpacity style={styles.editButton}>
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
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
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
