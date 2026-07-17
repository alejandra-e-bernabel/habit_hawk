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
import useGetWeeklyLeaderboard from "@/hooks/leaderboard/useGetWeeklyLeaderboard";
import useGetWeeklyStats from "@/hooks/leaderboard/useGetWeeklyStats";

const LeaderboardPreview = () => {
  const router = useRouter();
  const { leaderboard, loading: leaderboardLoading } = useGetWeeklyLeaderboard();
  const { weeklyStats, loading: statsLoading } = useGetWeeklyStats();

  const loading = leaderboardLoading || statsLoading;

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Weekly Leaderboard</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F5FD6" />
        </View>
      </View>
    );
  }

  const topEntries = leaderboard?.entries.slice(0, 5) || [];
  const userStats = weeklyStats;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Weekly Leaderboard</Text>
          {leaderboard && (
            <Text style={styles.subtitle}>
              {new Date(leaderboard.week_start).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}{" "}
              -{" "}
              {new Date(leaderboard.week_end).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => router.push("/(tabs)/leaderboard")}
        >
          <Text style={styles.viewAllText}>View All</Text>
          <Ionicons name="chevron-forward" size={16} color="#4F5FD6" />
        </TouchableOpacity>
      </View>

      {userStats && (
        <View style={styles.userStatsCard}>
          <View style={styles.userStatsLeft}>
            <Text style={styles.userStatsLabel}>Your Rank</Text>
            <Text style={styles.userStatsValue}>
              {userStats.rank ? `#${userStats.rank}` : ""}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.userStatsRight}>
            <Text style={styles.userStatsLabel}>Your Score</Text>
            <Text style={styles.userStatsValue}>{userStats.total_score}</Text>
          </View>
        </View>
      )}

      {topEntries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="trophy-outline" size={48} color="#999" />
          <Text style={styles.emptyText}>No leaderboard entries yet</Text>
          <Text style={styles.emptySubtext}>
            Complete habits to earn points and climb the leaderboard!
          </Text>
        </View>
      ) : (
        <FlatList
          data={topEntries}
          keyExtractor={(item) => item.user_id.toString()}
          renderItem={({ item, index }) => (
            <View
              style={[
                styles.leaderboardRow,
                item.is_current_user && styles.leaderboardRowHighlight,
              ]}
            >
              <View style={styles.rankContainer}>
                {index === 0 && (
                  <Ionicons name="trophy" size={20} color="#FFD700" />
                )}
                {index === 1 && (
                  <Ionicons name="trophy" size={20} color="#C0C0C0" />
                )}
                {index === 2 && (
                  <Ionicons name="trophy" size={20} color="#CD7F32" />
                )}
                {index > 2 && (
                  <Text style={styles.rankText}>#{item.rank}</Text>
                )}
              </View>
              <View style={styles.userInfo}>
                <Text
                  style={[
                    styles.username,
                    item.is_current_user && styles.usernameHighlight,
                  ]}
                  numberOfLines={1}
                >
                  {item.username}
                  {item.is_current_user && " (You)"}
                </Text>
              </View>
              <View style={styles.scoreContainer}>
                <Text style={styles.scoreText}>{item.total_score}</Text>
                <Text style={styles.scoreLabel}>pts</Text>
              </View>
            </View>
          )}
          scrollEnabled={false}
        />
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
    alignItems: "flex-start",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  subtitle: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewAllText: {
    fontSize: 14,
    color: "#4F5FD6",
    marginRight: 4,
    fontWeight: "600",
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  userStatsCard: {
    flexDirection: "row",
    backgroundColor: "#F8F9FF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E0E4FF",
  },
  userStatsLeft: {
    flex: 1,
    alignItems: "center",
  },
  userStatsRight: {
    flex: 1,
    alignItems: "center",
  },
  divider: {
    width: 1,
    backgroundColor: "#E0E4FF",
    marginHorizontal: 16,
  },
  userStatsLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  userStatsValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4F5FD6",
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#333",
    marginTop: 12,
    fontWeight: "600",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  leaderboardRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  leaderboardRowHighlight: {
    backgroundColor: "#F8F9FF",
    borderWidth: 1,
    borderColor: "#4F5FD6",
  },
  rankContainer: {
    width: 32,
    alignItems: "center",
    marginRight: 12,
  },
  rankText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  usernameHighlight: {
    fontWeight: "700",
    color: "#4F5FD6",
  },
  scoreContainer: {
    alignItems: "flex-end",
  },
  scoreText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  scoreLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
});

export default LeaderboardPreview;
