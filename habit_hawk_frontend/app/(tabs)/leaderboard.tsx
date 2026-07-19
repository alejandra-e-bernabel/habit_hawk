import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";
import useGetWeeklyLeaderboard from "@/hooks/leaderboard/useGetWeeklyLeaderboard";
import useGetWeeklyStats from "@/hooks/leaderboard/useGetWeeklyStats";
import type { LeaderboardEntry } from "@/types/leaderboard";
import AvatarIcon from "@/components/AvatarIcon";

export default function Leaderboard() {
  const router = useRouter();
  const { leaderboard, loading: leaderboardLoading } = useGetWeeklyLeaderboard();
  const { weeklyStats, loading: statsLoading } = useGetWeeklyStats();
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week, -1 = last week, etc.

  const loading = leaderboardLoading || statsLoading;

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Leaderboard</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </View>
    );
  }

  const entries = leaderboard?.entries || [];
  const top3 = entries.slice(0, 3);
  const restOfList = entries.slice(3);

  // Find current user
  const currentUserEntry = entries.find(entry => entry.is_current_user);
  const currentUserRank = currentUserEntry?.rank || 0;
  const isUserInTop3 = currentUserRank <= 3 && currentUserRank > 0;
  const isUserInList = currentUserRank > 3 && currentUserRank <= entries.length;

  // Show pinned row if user is not in top 3 and not in visible list
  const showPinnedRow = !isUserInTop3 && currentUserEntry && restOfList.length > 0;

  // Helper to get display name
  const getDisplayName = (entry: LeaderboardEntry) => {
    if (entry.first_name || entry.last_name) {
      return `${entry.first_name || ''} ${entry.last_name || ''}`.trim();
    }
    return entry.username;
  };

  // Render podium user
  const renderPodiumUser = (entry: LeaderboardEntry, position: number) => {
    const isFirst = position === 0;
    const isSecond = position === 1;
    const isThird = position === 2;
    const avatarSize = isFirst ? 72 : 56;

    return (
      <View
        key={entry.user_id}
        style={[
          styles.podiumUser,
          isFirst && styles.podiumUserFirst,
        ]}
      >
        {isFirst && (
          <Ionicons
            name="trophy"
            size={32}
            color="#F59E0B"
            style={styles.trophyIcon}
          />
        )}
        <View>
          <AvatarIcon
            firstName={entry.first_name}
            lastName={entry.last_name}
            username={entry.username}
            profileIconName={entry.profile_icon_name}
            profileImageUrl={entry.profile_image_url}
            size={avatarSize}
            borderColor={entry.is_current_user ? Colors.primary : undefined}
            borderWidth={entry.is_current_user ? 2 : 0}
          />
          <View style={[styles.rankBadge, isFirst && styles.rankBadgeFirst]}>
            <Text style={styles.rankBadgeText}>{entry.rank}</Text>
          </View>
        </View>
        <Text
          style={[styles.podiumUsername, isFirst && styles.podiumUsernameFirst]}
          numberOfLines={1}
        >
          {getDisplayName(entry)}
        </Text>
        {entry.is_current_user && (
          <View style={styles.youPill}>
            <Text style={styles.youPillText}>You</Text>
          </View>
        )}
        <View style={styles.podiumScore}>
          <Ionicons name="flash" size={14} color={Colors.accentText} />
          <Text style={styles.podiumScoreText}>{entry.total_score}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Leaderboard</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity
            style={styles.headerIcon}
            onPress={() => router.push("/friends")}
          >
            <Ionicons name="person-add-outline" size={22} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerIcon}
            onPress={() => router.push("/settings")}
          >
            <Ionicons name="settings-outline" size={22} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Week Selector */}
      <View style={styles.weekSelector}>
        <TouchableOpacity
          onPress={() => setWeekOffset(weekOffset - 1)}
          disabled={false}
        >
          <Ionicons name="chevron-back" size={20} color={Colors.textMuted} />
        </TouchableOpacity>
        <View style={styles.weekSelectorCenter}>
          {leaderboard && (
            <>
              <Text style={styles.weekRange}>
                {new Date(leaderboard.week_start).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}{" "}
                –{" "}
                {new Date(leaderboard.week_end).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </Text>
              <Text style={styles.weekScope}>
                {weekOffset === 0 ? "This week" : "Past week"} · friends
              </Text>
            </>
          )}
        </View>
        <TouchableOpacity
          onPress={() => setWeekOffset(weekOffset + 1)}
          disabled={weekOffset >= 0}
        >
          <Ionicons
            name="chevron-forward"
            size={20}
            color={weekOffset >= 0 ? Colors.border : Colors.textMuted}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {entries.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="person-add-outline" size={40} color={Colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>Add friends to compete</Text>
            <TouchableOpacity
              style={styles.inviteButton}
              onPress={() => router.push("/friends")}
            >
              <Text style={styles.inviteButtonText}>Invite a friend</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Podium for top 3 */}
            {top3.length > 0 && (
              <View style={styles.podiumContainer}>
                {top3.length >= 2 && renderPodiumUser(top3[1], 1)}
                {top3.length >= 1 && renderPodiumUser(top3[0], 0)}
                {top3.length >= 3 && renderPodiumUser(top3[2], 2)}
              </View>
            )}

            {/* List for rest */}
            {restOfList.length > 0 && (
              <View style={styles.listContainer}>
                {restOfList.map((entry) => (
                  <View
                    key={entry.user_id}
                    style={[
                      styles.listItem,
                      entry.is_current_user && styles.listItemHighlight,
                    ]}
                  >
                    <Text
                      style={[
                        styles.listRank,
                        entry.is_current_user && styles.listRankHighlight,
                      ]}
                    >
                      {entry.rank}
                    </Text>
                    <AvatarIcon
                      firstName={entry.first_name}
                      lastName={entry.last_name}
                      username={entry.username}
                      profileIconName={entry.profile_icon_name}
                      profileImageUrl={entry.profile_image_url}
                      size={30}
                    />
                    <Text
                      style={[
                        styles.listUsername,
                        entry.is_current_user && styles.listUsernameHighlight,
                      ]}
                      numberOfLines={1}
                    >
                      {getDisplayName(entry)}
                      {entry.is_current_user && (
                        <Text style={styles.youSuffix}> (You)</Text>
                      )}
                    </Text>
                    <Text
                      style={[
                        styles.listScore,
                        entry.is_current_user && styles.listScoreHighlight,
                      ]}
                    >
                      {entry.total_score}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Pinned "You" Row */}
            {showPinnedRow && currentUserEntry && (
              <>
                <View style={styles.pinnedDivider}>
                  <Text style={styles.pinnedDividerText}>···</Text>
                </View>
                <View style={styles.listContainer}>
                  <View style={[styles.listItem, styles.listItemHighlight]}>
                    <Text style={[styles.listRank, styles.listRankHighlight]}>
                      {currentUserEntry.rank}
                    </Text>
                    <AvatarIcon
                      firstName={currentUserEntry.first_name}
                      lastName={currentUserEntry.last_name}
                      username={currentUserEntry.username}
                      profileIconName={currentUserEntry.profile_icon_name}
                      profileImageUrl={currentUserEntry.profile_image_url}
                      size={30}
                    />
                    <Text
                      style={[styles.listUsername, styles.listUsernameHighlight]}
                      numberOfLines={1}
                    >
                      {getDisplayName(currentUserEntry)}
                      <Text style={styles.youSuffix}> (You)</Text>
                    </Text>
                    <Text style={[styles.listScore, styles.listScoreHighlight]}>
                      {currentUserEntry.total_score}
                    </Text>
                  </View>
                </View>
              </>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  // Header styles
  header: {
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  headerIcons: {
    flexDirection: "row",
    gap: 12,
  },
  headerIcon: {
    padding: 4,
  },
  // Week selector styles
  weekSelector: {
    backgroundColor: Colors.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 16,
  },
  weekSelectorCenter: {
    alignItems: "center",
  },
  weekRange: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  weekScope: {
    fontSize: 11,
    color: Colors.textFaint,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  // Empty state styles
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    marginTop: 60,
  },
  emptyIconContainer: {
    backgroundColor: Colors.primaryTint,
    borderRadius: 50,
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  inviteButton: {
    backgroundColor: Colors.primary,
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  inviteButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "600",
  },
  // Podium styles
  podiumContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    paddingVertical: 32,
    paddingHorizontal: 16,
    backgroundColor: Colors.white,
  },
  podiumUser: {
    alignItems: "center",
    flex: 1,
    maxWidth: 120,
  },
  podiumUserFirst: {
    marginBottom: 20,
  },
  trophyIcon: {
    marginBottom: 8,
  },
  rankBadge: {
    backgroundColor: Colors.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -14,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  rankBadgeFirst: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  rankBadgeText: {
    color: Colors.white,
    fontWeight: "bold",
    fontSize: 13,
  },
  podiumUsername: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 4,
    textAlign: "center",
  },
  podiumUsernameFirst: {
    fontSize: 14,
  },
  youPill: {
    backgroundColor: Colors.primaryTint,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 4,
  },
  youPillText: {
    fontSize: 11,
    fontWeight: "500",
    color: Colors.primary,
  },
  podiumScore: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  podiumScoreText: {
    fontSize: 13,
    color: Colors.accentText,
    fontWeight: "600",
  },
  // List styles
  listContainer: {
    padding: 16,
    paddingTop: 8,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 11,
    marginBottom: 12,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  listItemHighlight: {
    backgroundColor: Colors.primaryTint,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  listRank: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textMuted,
    width: 32,
    textAlign: "center",
    marginRight: 12,
  },
  listRankHighlight: {
    color: Colors.primary,
  },
  listUsername: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: Colors.textPrimary,
    marginLeft: 12,
  },
  listUsernameHighlight: {
    fontWeight: "600",
  },
  youSuffix: {
    color: Colors.primary,
  },
  listScore: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  listScoreHighlight: {
    color: Colors.textPrimary,
  },
  // Pinned row styles
  pinnedDivider: {
    alignItems: "center",
    paddingVertical: 8,
  },
  pinnedDividerText: {
    fontSize: 14,
    color: Colors.textFaint,
    letterSpacing: 4,
  },
});
