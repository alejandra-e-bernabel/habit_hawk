import React from "react";

import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Statistics() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <Ionicons name="flame" size={24} color="#FF6B6B" />
            <Text style={styles.statTitle}>Current Streak</Text>
          </View>
          <Text style={styles.statValue}>0 days</Text>
          <Text style={styles.statSubtext}>Keep going!</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <Ionicons name="checkmark-done" size={24} color="#51CF66" />
            <Text style={styles.statTitle}>Habits Completed</Text>
          </View>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statSubtext}>This week</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <Ionicons name="trending-up" size={24} color="#4DABF7" />
            <Text style={styles.statTitle}>Completion Rate</Text>
          </View>
          <Text style={styles.statValue}>0%</Text>
          <Text style={styles.statSubtext}>All time</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <Ionicons name="star" size={24} color="#FFD43B" />
            <Text style={styles.statTitle}>Total Points</Text>
          </View>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statSubtext}>Lifetime earnings</Text>
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
