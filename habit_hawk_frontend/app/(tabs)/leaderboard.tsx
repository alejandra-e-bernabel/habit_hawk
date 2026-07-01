import React from "react";

import { View, Text, StyleSheet, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Leaderboard() {
  // Mock data - will be replaced with real data
  const leaderboardData = [
    // { id: 1, username: "User1", score: 1250, rank: 1 },
    // { id: 2, username: "User2", score: 980, rank: 2 },
  ];

  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Ionicons name="trophy" size={24} color="#FFD700" />;
      case 2:
        return <Ionicons name="trophy" size={24} color="#C0C0C0" />;
      case 3:
        return <Ionicons name="trophy" size={24} color="#CD7F32" />;
      default:
        return <Text style={styles.rankNumber}>{rank}</Text>;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>This Week&apos;s Leaders</Text>
        <Text style={styles.headerSubtitle}>Monday - Sunday</Text>
      </View>

      {leaderboardData.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="trophy-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>No Data Yet</Text>
          <Text style={styles.emptyText}>
            Complete habits to earn points and climb the leaderboard!
          </Text>
        </View>
      ) : (
        <FlatList
          data={leaderboardData}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.leaderboardItem}>
              <View style={styles.rankContainer}>{getMedalIcon(item.rank)}</View>
              <Text style={styles.username}>{item.username}</Text>
              <Text style={styles.score}>{item.score} pts</Text>
            </View>
          )}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#fff",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  list: {
    padding: 16,
  },
  leaderboardItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  rankContainer: {
    width: 40,
    alignItems: "center",
    marginRight: 16,
  },
  rankNumber: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
  },
  username: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  score: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
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
});
