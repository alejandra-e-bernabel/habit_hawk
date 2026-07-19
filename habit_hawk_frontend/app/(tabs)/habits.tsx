import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import useGetHabitsWithCompletion, { HabitWithCompletion } from "@/hooks/habits/useGetHabitsWithCompletion";
import { HabitPeriod, LogStatus } from "@/types/habits";
import { getIconByName } from "@/constants/HabitIcons";
import { Colors } from "@/constants/Colors";
import { logHabit } from "@/services/HabitServices";

export default function Habits() {
  const { habits, todayData, bestStreak, loading, error, refetch } = useGetHabitsWithCompletion();

  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [refetch])
  );

  // Group habits by period
  const groupedHabits = React.useMemo(() => {
    const groups: Record<HabitPeriod, HabitWithCompletion[]> = {
      [HabitPeriod.DAILY]: [],
      [HabitPeriod.WEEKLY]: [],
      [HabitPeriod.MONTHLY]: [],
    };

    habits.forEach((habit) => {
      if (habit.is_active) {
        groups[habit.period].push(habit);
      }
    });

    return groups;
  }, [habits]);

  // Calculate summary data
  const activeHabits = habits.filter((h) => h.is_active);
  const completedToday = todayData?.completed_count ?? 0;
  const totalActive = todayData?.total_habits ?? activeHabits.length;

  const handleHabitPress = (habitId: number) => {
    router.push(`/(tabs)/habits/${habitId}`);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Habits</Text>
      <View style={styles.headerActions}>
        <TouchableOpacity
          onPress={() => router.push("/add-habit")}
          style={styles.headerAction}
        >
          <Ionicons name="add" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push("/settings")}
          style={styles.headerAction}
        >
          <Ionicons name="settings-outline" size={24} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSummaryCard = () => (
    <View style={styles.summaryCard}>
      <View style={styles.summaryLeft}>
        <Text style={styles.summaryLabel}>Today</Text>
        <View style={styles.progressBarContainer}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: totalActive > 0
                    ? `${(completedToday / totalActive) * 100}%`
                    : "0%",
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {completedToday} of {totalActive} done
          </Text>
        </View>
      </View>
      <View style={styles.bestStreakPill}>
        <Ionicons name="flame" size={16} color={Colors.accentText} />
        <Text style={styles.bestStreakText}>{bestStreak}</Text>
      </View>
    </View>
  );

  const renderHabitRow = (habit: HabitWithCompletion) => {
    const icon = getIconByName(habit.icon_name);

    return (
      <TouchableOpacity
        key={habit.habit_id}
        style={styles.habitCard}
        onPress={() => handleHabitPress(habit.habit_id)}
      >
        {/* Icon Chip */}
        <View style={styles.iconChip}>
          <Ionicons
            name={icon.ionicon as any}
            size={18}
            color={Colors.primary}
          />
        </View>

        {/* Text Block */}
        <View style={styles.habitTextBlock}>
          <Text style={styles.habitName} numberOfLines={1}>
            {habit.name}
          </Text>
          <View style={styles.habitMeta}>
            <Text style={styles.habitMetaText}>
              {habit.target_count}x {habit.period}
            </Text>
            {habit.current_streak > 0 && (
              <>
                <Text style={styles.habitMetaSeparator}>·</Text>
                <Ionicons name="flame" size={12} color={Colors.accentText} />
                <Text style={styles.habitStreakText}>{habit.current_streak} day streak</Text>
              </>
            )}
          </View>
        </View>

        {/* Status Control */}
        {renderStatusControl(habit)}
      </TouchableOpacity>
    );
  };

  const handleToggleCompletion = async (habit: HabitWithCompletion) => {
    try {
      // Toggle completion status
      const newStatus = habit.is_completed ? LogStatus.INCOMPLETE : LogStatus.COMPLETED;

      await logHabit(habit.habit_id, {
        status: newStatus,
      });

      // Refresh data
      refetch();
    } catch (err) {
      console.error("Failed to toggle habit completion:", err);
    }
  };

  const renderStatusControl = (habit: HabitWithCompletion) => {
    switch (habit.period) {
      case HabitPeriod.DAILY:
        // Daily: Check circle
        const isCompleted = habit.is_completed ?? false;
        return (
          <TouchableOpacity
            style={[
              styles.checkCircle,
              isCompleted && styles.checkCircleFilled,
            ]}
            onPress={(e) => {
              e.stopPropagation();
              handleToggleCompletion(habit);
            }}
          >
            {isCompleted && (
              <Ionicons name="checkmark" size={16} color={Colors.white} />
            )}
          </TouchableOpacity>
        );

      case HabitPeriod.WEEKLY:
        // Weekly: Progress readout
        const completedCount = habit.weekly_completed_count ?? 0;
        const targetCount = habit.target_count;
        return (
          <View style={styles.weeklyProgress}>
            <Text
              style={[
                styles.weeklyProgressText,
                completedCount === 0 && styles.weeklyProgressTextEmpty,
              ]}
            >
              {completedCount} of {targetCount}
            </Text>
            <View style={styles.dotRow}>
              {Array.from({ length: targetCount }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    i < completedCount
                      ? styles.dotCompleted
                      : styles.dotRemaining,
                  ]}
                />
              ))}
            </View>
          </View>
        );

      case HabitPeriod.MONTHLY:
        // Monthly: Due chip
        const isCompletedThisPeriod = habit.monthly_completed ?? false;
        if (isCompletedThisPeriod) {
          return (
            <View style={styles.checkCircleFilled}>
              <Ionicons name="checkmark" size={16} color={Colors.white} />
            </View>
          );
        }
        const daysUntilDue = habit.monthly_days_until_due ?? 0;
        return (
          <View style={styles.dueChip}>
            <Text style={styles.dueChipText}>
              {daysUntilDue === 0 ? "Due today" : `Due in ${daysUntilDue}d`}
            </Text>
          </View>
        );

      default:
        return null;
    }
  };

  const renderSectionLabel = (label: string) => (
    <Text style={styles.sectionLabel}>{label}</Text>
  );

  const renderSection = (
    period: HabitPeriod,
    label: string,
    habits: HabitWithCompletion[]
  ) => {
    if (habits.length === 0) return null;

    return (
      <View key={period} style={styles.section}>
        {renderSectionLabel(label)}
        {habits.map(renderHabitRow)}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconChip}>
        <Ionicons name="add" size={32} color={Colors.primary} />
      </View>
      <Text style={styles.emptyTitle}>Start your first habit</Text>
      <Text style={styles.emptyText}>
        Build better habits one day at a time
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => router.push("/add-habit")}
      >
        <Text style={styles.emptyButtonText}>Add habit</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.errorState}>
          <Ionicons name="alert-circle-outline" size={64} color={Colors.error} />
          <Text style={styles.errorTitle}>Couldn&apos;t Load Habits</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refetch}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (activeHabits.length === 0) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        {renderEmptyState()}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderSummaryCard()}
        {renderSection(HabitPeriod.DAILY, "Daily", groupedHabits[HabitPeriod.DAILY])}
        {renderSection(HabitPeriod.WEEKLY, "Weekly", groupedHabits[HabitPeriod.WEEKLY])}
        {renderSection(HabitPeriod.MONTHLY, "Monthly", groupedHabits[HabitPeriod.MONTHLY])}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  headerActions: {
    flexDirection: "row",
    gap: 16,
  },
  headerAction: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  summaryLeft: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: 6,
  },
  progressBarContainer: {
    gap: 6,
  },
  progressTrack: {
    height: 8,
    backgroundColor: Colors.primarySoft,
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primaryBright,
    borderRadius: 999,
  },
  progressText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textPrimary,
    textAlign: "right",
  },
  bestStreakPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.accentSoft,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    gap: 4,
  },
  bestStreakText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.accentText,
  },
  section: {
    gap: 10,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  habitCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  iconChip: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.primaryTint,
    justifyContent: "center",
    alignItems: "center",
  },
  habitTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  habitName: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  habitMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  habitMetaText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  habitMetaSeparator: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  habitStreakText: {
    fontSize: 12,
    color: Colors.accentText,
  },
  checkCircle: {
    width: 27,
    height: 27,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: Colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  checkCircleFilled: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  weeklyProgress: {
    alignItems: "flex-end",
    gap: 6,
  },
  weeklyProgressText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.primary,
  },
  weeklyProgressTextEmpty: {
    color: Colors.textFaint,
  },
  dotRow: {
    flexDirection: "row",
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotCompleted: {
    backgroundColor: Colors.primaryBright,
  },
  dotRemaining: {
    backgroundColor: Colors.primarySoft,
  },
  dueChip: {
    backgroundColor: Colors.backgroundSecondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  dueChipText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyIconChip: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: Colors.primaryTint,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: "center",
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.white,
  },
  loadingState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: "center",
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.white,
  },
});
