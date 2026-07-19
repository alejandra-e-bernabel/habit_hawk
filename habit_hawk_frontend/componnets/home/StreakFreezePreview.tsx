import React from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { Colors } from "@/constants/Colors";

import useGetFreezeInventory from "@/hooks/freezes/useGetFreezeInventory";
import useGetFreezeProgress from "@/hooks/freezes/useGetFreezeProgress";

const FREEZE_INTERVAL = 7;

const StreakFreezePreview = () => {
  const router = useRouter();
  const { inventory, loading: inventoryLoading, error: inventoryError, refetch: refetchInventory } =
    useGetFreezeInventory();
  const { progress, loading: progressLoading, error: progressError, refetch: refetchProgress } =
    useGetFreezeProgress();

  useFocusEffect(
    React.useCallback(() => {
      refetchInventory();
      refetchProgress();
    }, [refetchInventory, refetchProgress])
  );

  const loading = inventoryLoading || progressLoading;
  const error = inventoryError || progressError;

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Streak Freezes</Text>
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
          <Text style={styles.title}>Streak Freezes</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load freeze progress</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Streak Freezes</Text>
          <Text style={styles.subtitle}>
            Earn 1 freeze every {FREEZE_INTERVAL} completed streak days
          </Text>
        </View>
        <TouchableOpacity
          style={styles.summaryPill}
          onPress={() => router.push("/(tabs)/habits")}
        >
          <Ionicons name="snow-outline" size={16} color={Colors.primary} />
          <Text style={styles.summaryPillText}>
            {inventory?.available_count || 0} available
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Earned</Text>
          <Text style={styles.summaryValue}>{inventory?.total_earned_count || 0}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Available</Text>
          <Text style={styles.summaryValue}>{inventory?.available_count || 0}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Applied</Text>
          <Text style={styles.summaryValue}>{inventory?.applied_count || 0}</Text>
        </View>
      </View>

      <FlatList
        data={progress}
        keyExtractor={(item) => item.habit_id.toString()}
        renderItem={({ item }) => {
          const progressPercent = Math.max(
            0,
            Math.min(100, ((FREEZE_INTERVAL - item.days_until_next_freeze) / FREEZE_INTERVAL) * 100)
          );

          return (
            <View style={styles.habitCard}>
              <View style={styles.habitCardHeader}>
                <View style={styles.habitTextBlock}>
                  <Text style={styles.habitName} numberOfLines={1}>
                    {item.habit_name}
                  </Text>
                  <Text style={styles.habitMeta}>
                    {item.current_streak} day streak • {item.days_until_next_freeze} more check-ins to earn a freeze
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.detailsButton}
                  onPress={() => router.push(`/(tabs)/habits/${item.habit_id}`)}
                >
                  <Text style={styles.applyButtonText}>Details</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.progressBarBackground}>
                <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
              </View>

              <View style={styles.progressFooter}>
                <Text style={styles.progressFooterText}>
                  {item.freezes_earned_count} freeze{item.freezes_earned_count === 1 ? "" : "s"} earned by this habit
                </Text>
              </View>
            </View>
          );
        }}
        scrollEnabled={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
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
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  summaryPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.primaryLightest,
    borderColor: Colors.borderLight,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  summaryPillText: {
    color: Colors.primary,
    fontWeight: "600",
    fontSize: 13,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.primaryLightest,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.primary,
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
    color: Colors.error,
    fontSize: 14,
  },
  habitCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  habitCardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 10,
  },
  habitTextBlock: {
    flex: 1,
  },
  habitName: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  habitMeta: {
    marginTop: 4,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  detailsButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  applyButtonText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "700",
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 999,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: Colors.success,
    borderRadius: 999,
  },
  progressFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  progressFooterText: {
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
    paddingRight: 12,
  },
  detailsLink: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: "700",
  },
  separator: {
    height: 10,
  },
});

export default StreakFreezePreview;
