import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams, useFocusEffect, router, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import useGetHabit from "@/hooks/habits/useGetHabit";
import useGetTodaysHabits from "@/hooks/habits/useGetTodaysHabits";
import useGetHabitLogs from "@/hooks/habits/useGetHabitLogs";
import useGetHabitStats from "@/hooks/habits/useGetHabitStats";
import useLogHabit from "@/hooks/habits/useLogHabit";
import useUpdateHabitLog from "@/hooks/habits/useUpdateHabitLog";
import useGetFreezeInventory from "@/hooks/freezes/useGetFreezeInventory";
import useGetFreezeProgress from "@/hooks/freezes/useGetFreezeProgress";
import useApplyFreeze from "@/hooks/freezes/useApplyFreeze";
import HabitCalendar from "@/components/HabitCalendar";
import SessionTimer from "@/components/SessionTimer";
import SessionCompletionModal from "@/components/SessionCompletionModal";
import { FreezeStatus } from "@/types/freezes";
import { LogStatus, HabitType } from "@/types/habits";
import { Colors } from "@/constants/Colors";


export default function HabitDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const habitId = Number(id);
  const { habit, loading, error, refetch } = useGetHabit(habitId);
  const { todaysHabits, refetch: refetchTodaysHabits } = useGetTodaysHabits();
  const { logs, refetch: refetchLogs } = useGetHabitLogs(habitId);
  const { stats, loading: statsLoading, refetch: refetchStats } = useGetHabitStats(habitId);
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

  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [sessionDuration, setSessionDuration] = useState<number | undefined>(undefined);

  const currentFreezeProgress = progress.find((item) => item.habit_id === habitId);
  const availableFreezes = inventory?.freezes.filter(
    (freeze) => freeze.status === FreezeStatus.AVAILABLE
  ) ?? [];
  const today = todaysHabits?.date;
  const todayHabit = todaysHabits?.habits.find((item) => item.habit_id === habitId);
  const isTodayActionTaken = todayHabit?.log_status !== null;
  const isMarkedComplete = todayHabit?.is_completed ?? false;
  const isPeriodGoalMet = todayHabit?.is_period_goal_met ?? false;

  // Allow logging if: no action taken today OR (period goal met but not logged today for daily habits)
  // For weekly/monthly, always allow logging additional sessions even if goal is met
  const canLogSession = !isTodayActionTaken && !loggingHabit && !updatingHabitLog;
  const isCompleteButtonDisabled = !canLogSession;
  const isFreezeButtonDisabled = isTodayActionTaken || availableFreezes.length === 0 || applyingFreeze;

  // Calendar state - current month
  const currentDate = new Date();
  const [calendarMonth, setCalendarMonth] = useState(currentDate.getMonth());
  const [calendarYear, setCalendarYear] = useState(currentDate.getFullYear());

  useFocusEffect(
    React.useCallback(() => {
      refetch();
      refetchTodaysHabits();
      refetchInventory();
      refetchProgress();
      refetchLogs();
      refetchStats();
    }, [refetch, refetchTodaysHabits, refetchInventory, refetchProgress, refetchLogs, refetchStats])
  );

  const handleMarkComplete = async (duration?: number) => {
    if (!habit) {
      return;
    }

    setSessionDuration(duration);
    setShowCompletionModal(true);
  };

  const handleSessionComplete = async (rating?: number, note?: string) => {
    if (!habit) {
      return;
    }

    try {
      const logData: any = {
        status: LogStatus.COMPLETED,
        logged_for_date: today || undefined,
      };

      if (sessionDuration) {
        logData.duration_minutes = sessionDuration;
      }

      if (rating) {
        logData.session_rating = rating;
      }

      if (note) {
        logData.note = note;
      }

      if (todayHabit?.log_status && today) {
        await updateLog(habit.habit_id, today, logData);
      } else {
        await logHabit(habit.habit_id, logData);
      }

      await Promise.all([
        refetch(),
        refetchTodaysHabits(),
        refetchInventory(),
        refetchProgress(),
        refetchLogs(),
        refetchStats(),
      ]);

      Alert.alert("Success!", "Session logged successfully.");
    } catch (err) {
      Alert.alert(
        "Couldn't Log Session",
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
      await Promise.all([refetch(), refetchInventory(), refetchProgress(), refetchLogs()]);
      Alert.alert("Freeze Applied", "Your streak freeze has been applied.");
    } catch (err) {
      Alert.alert(
        "Couldn't Apply Freeze",
        err instanceof Error ? err.message : "Please try again"
      );
    }
  };

  const navigateCalendar = (direction: "prev" | "next") => {
    if (direction === "prev") {
      if (calendarMonth === 0) {
        setCalendarMonth(11);
        setCalendarYear(calendarYear - 1);
      } else {
        setCalendarMonth(calendarMonth - 1);
      }
    } else {
      if (calendarMonth === 11) {
        setCalendarMonth(0);
        setCalendarYear(calendarYear + 1);
      } else {
        setCalendarMonth(calendarMonth + 1);
      }
    }
  };

  if (loading || freezeInventoryLoading || freezeProgressLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (error || !habit) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={64} color={Colors.textMuted} />
        <Text style={styles.emptyTitle}>Couldn&apos;t Load Habit</Text>
        <Text style={styles.emptyText}>{error || "Habit not found"}</Text>
      </View>
    );
  }

  // Recent logs with notes
  const recentLogsWithNotes = logs
    .filter((log) => log.note)
    .slice(0, 5);

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
          {/* Status Hero Card - NEW */}
          <View style={[
            styles.card,
            styles.statusCard,
            isPeriodGoalMet ? styles.statusCardComplete : styles.statusCardPending
          ]}>
            <View style={styles.statusHeader}>
              <View style={styles.statusIconContainer}>
                <Ionicons
                  name={isPeriodGoalMet ? "checkmark-circle" : "alert-circle"}
                  size={32}
                  color={isPeriodGoalMet ? Colors.success : Colors.primary}
                />
              </View>
              <View style={styles.statusTextContainer}>
                <Text style={styles.statusTitle}>
                  {isPeriodGoalMet
                    ? (isTodayActionTaken ? "Completed for today!" : "Period goal met!")
                    : "Action needed"}
                </Text>
                <Text style={styles.statusSubtitle}>
                  {isPeriodGoalMet
                    ? (isTodayActionTaken
                        ? `Great work! Keep your streak going.`
                        : `Goal met! You can still log more sessions.`)
                    : (habit?.period === "weekly"
                        ? `Complete ${habit?.target_count - (todayHabit?.weekly_completed_count || 0)} more this week`
                        : `Complete your session to continue your streak`)
                  }
                </Text>
              </View>
            </View>

            {/* Streak Display */}
            <View style={styles.streakContainer}>
              <View style={styles.streakBadge}>
                <Ionicons name="flame" size={28} color={Colors.danger} />
                <Text style={styles.streakNumber}>{stats?.current_streak || 0}</Text>
                <Text style={styles.streakLabel}>day streak</Text>
              </View>
              {!statsLoading && stats && (
                <View style={styles.quickStatsRow}>
                  <View style={styles.quickStat}>
                    <Text style={styles.quickStatValue}>{stats.completion_rate_7days}%</Text>
                    <Text style={styles.quickStatLabel}>7-day rate</Text>
                  </View>
                  <View style={styles.quickStat}>
                    <Text style={styles.quickStatValue}>{stats.total_sessions}</Text>
                    <Text style={styles.quickStatLabel}>sessions</Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Action Zone - Session Timer / Complete Button */}
          {habit.habit_type === HabitType.LOG && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="timer-outline" size={24} color={Colors.primary} />
                <Text style={styles.cardTitle}>
                  {isTodayActionTaken
                    ? "Session Already Logged Today"
                    : (isPeriodGoalMet ? "Log Extra Session" : "Log Your Session")}
                </Text>
              </View>
              {isPeriodGoalMet && !isTodayActionTaken && (
                <Text style={styles.goalMetNotice}>
                  Your {habit.period} goal is complete! Additional sessions will still count toward your streak and points.
                </Text>
              )}
              <SessionTimer
                onComplete={(duration) => handleMarkComplete(duration)}
                disabled={isCompleteButtonDisabled}
              />
            </View>
          )}

          {habit.habit_type === HabitType.REMINDER && (
            <View style={styles.card}>
              {isPeriodGoalMet && !isTodayActionTaken && (
                <Text style={styles.goalMetNotice}>
                  Your {habit.period} goal is complete! You can still log today if you&apos;d like.
                </Text>
              )}
              <TouchableOpacity
                style={[
                  styles.primaryActionButton,
                  isMarkedComplete && styles.primaryActionButtonComplete,
                  isCompleteButtonDisabled && styles.buttonDisabled,
                ]}
                onPress={() => handleMarkComplete()}
                disabled={isCompleteButtonDisabled}
              >
                {loggingHabit || updatingHabitLog ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <>
                    <Ionicons
                      name="checkmark-circle"
                      size={28}
                      color={isMarkedComplete ? Colors.textFaint : Colors.white}
                    />
                    <Text style={[
                      styles.primaryActionButtonText,
                      isMarkedComplete && styles.primaryActionButtonTextComplete
                    ]}>
                      {isMarkedComplete ? "Completed Today" : "Mark as Complete"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Apply Freeze Button */}
          {!isTodayActionTaken && availableFreezes.length > 0 && (
            <TouchableOpacity
              style={[
                styles.secondaryActionButton,
                isFreezeButtonDisabled && styles.buttonDisabled,
              ]}
              onPress={handleApplyFreeze}
              disabled={isFreezeButtonDisabled}
            >
              {applyingFreeze ? (
                <ActivityIndicator color={Colors.primary} />
              ) : (
                <>
                  <Ionicons name="snow" size={20} color={Colors.primary} />
                  <Text style={styles.secondaryActionButtonText}>
                    Apply Streak Freeze ({availableFreezes.length} available)
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {/* Quick Stats Card */}
          {!statsLoading && stats && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="stats-chart-outline" size={24} color={Colors.primary} />
                <Text style={styles.cardTitle}>Your Progress</Text>
              </View>

              <View style={styles.statsGrid}>
                {/* Current Streak */}
                <View style={styles.statBox}>
                  <Ionicons name="flame" size={24} color={Colors.danger} style={styles.statIcon} />
                  <Text style={styles.statValue}>{stats.current_streak}</Text>
                  <Text style={styles.statLabel}>Day Streak</Text>
                </View>

                {/* 7-Day Completion Rate */}
                <View style={styles.statBox}>
                  <Ionicons name="checkmark-circle" size={24} color={Colors.success} style={styles.statIcon} />
                  <Text style={styles.statValue}>{stats.completion_rate_7days}%</Text>
                  <Text style={styles.statLabel}>7-Day Rate</Text>
                </View>

                {/* Total Sessions */}
                <View style={styles.statBox}>
                  <Ionicons name="list" size={24} color={Colors.primary} style={styles.statIcon} />
                  <Text style={styles.statValue}>{stats.total_sessions}</Text>
                  <Text style={styles.statLabel}>Total Sessions</Text>
                </View>

                {/* Average Rating */}
                {stats.average_rating && (
                  <View style={styles.statBox}>
                    <Ionicons name="star" size={24} color={Colors.warning} style={styles.statIcon} />
                    <Text style={styles.statValue}>{stats.average_rating.toFixed(1)}</Text>
                    <Text style={styles.statLabel}>Avg Rating</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Motivation Section */}
          <View style={[styles.card, styles.motivationCard]}>
            <View style={styles.cardHeader}>
              <Ionicons name="bulb" size={24} color={Colors.warning} />
              <Text style={styles.cardTitle}>Why You&apos;re Doing This</Text>
            </View>
            <Text style={styles.motivationText}>
              {habit.motivation_note || "No motivation set yet. Add one to stay inspired!"}
            </Text>
          </View>

          {/* Detailed Stats - Progress Bars */}
          {!statsLoading && stats && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="trending-up" size={24} color={Colors.primary} />
                <Text style={styles.cardTitle}>Detailed Statistics</Text>
              </View>

              <View style={styles.progressSection}>
                <View style={styles.progressItem}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>Last 7 Days</Text>
                    <Text style={styles.progressPercentage}>{stats.completion_rate_7days}%</Text>
                  </View>
                  <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBar, { width: `${stats.completion_rate_7days}%` }]} />
                  </View>
                </View>

                <View style={styles.progressItem}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>Last 30 Days</Text>
                    <Text style={styles.progressPercentage}>{stats.completion_rate_30days}%</Text>
                  </View>
                  <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBar, { width: `${stats.completion_rate_30days}%` }]} />
                  </View>
                </View>

                <View style={styles.progressItem}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>All Time</Text>
                    <Text style={styles.progressPercentage}>{stats.completion_rate_all_time}%</Text>
                  </View>
                  <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBar, { width: `${stats.completion_rate_all_time}%` }]} />
                  </View>
                </View>
              </View>

              {/* Duration stats for log-type habits */}
              {habit.habit_type === HabitType.LOG && stats.total_duration_minutes && (
                <View style={styles.durationStats}>
                  <Text style={styles.durationText}>
                    Total Time: {Math.floor(stats.total_duration_minutes / 60)}h {stats.total_duration_minutes % 60}m
                  </Text>
                  {stats.average_session_duration && (
                    <Text style={styles.durationText}>
                      Avg Session: {stats.average_session_duration.toFixed(0)} minutes
                    </Text>
                  )}
                </View>
              )}
            </View>
          )}

          {/* Goal */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="flag-outline" size={24} color={Colors.success} />
              <Text style={styles.cardTitle}>Goal</Text>
            </View>
            <Text style={styles.goalText}>
              {habit.target_count} time{habit.target_count > 1 ? "s" : ""} {habit.period}
            </Text>
            {habit.target_duration_minutes && (
              <Text style={styles.goalSubtext}>
                Target duration: {habit.target_duration_minutes} minutes per session
              </Text>
            )}
          </View>

          {/* Streak Freeze */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="snow" size={24} color={Colors.info} />
              <Text style={styles.cardTitle}>Streak Freeze</Text>
            </View>
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

            <View style={styles.freezeCountContainer}>
              <Ionicons name="snow-outline" size={20} color={Colors.accentText} />
              <Text style={styles.freezeCountText}>
                {inventory?.available_count || 0} available freeze{(inventory?.available_count || 0) === 1 ? "" : "s"}
              </Text>
            </View>
          </View>

          {/* History Calendar */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="calendar" size={24} color={Colors.primary} />
              <Text style={styles.cardTitle}>History</Text>
            </View>

            <View style={styles.calendarNav}>
              <TouchableOpacity onPress={() => navigateCalendar("prev")}>
                <Ionicons name="chevron-back-outline" size={24} color={Colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigateCalendar("next")}>
                <Ionicons name="chevron-forward-outline" size={24} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            <HabitCalendar logs={logs} year={calendarYear} month={calendarMonth} />
          </View>

          {/* Journal/Notes Section */}
          {recentLogsWithNotes.length > 0 && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="journal" size={24} color={Colors.warning} />
                <Text style={styles.cardTitle}>Recent Journal Entries</Text>
              </View>

              {recentLogsWithNotes.map((log) => (
                <View key={log.log_id} style={styles.journalEntry}>
                  <View style={styles.journalHeader}>
                    <Text style={styles.journalDate}>
                      {new Date(log.logged_for_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </Text>
                    {log.session_rating && (
                      <View style={styles.ratingDisplay}>
                        {Array.from({ length: log.session_rating }).map((_, i) => (
                          <Ionicons key={i} name="star" size={14} color={Colors.warning} />
                        ))}
                      </View>
                    )}
                  </View>
                  <Text style={styles.journalNote}>{log.note}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Edit Button */}
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push(`/edit-habit?id=${habit.habit_id}`)}
          >
            <Ionicons name="create-outline" size={20} color={Colors.primary} />
            <Text style={styles.editButtonText}>Edit Habit</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Session Completion Modal */}
      <SessionCompletionModal
        visible={showCompletionModal}
        onClose={() => {
          setShowCompletionModal(false);
          setSessionDuration(undefined);
        }}
        onSubmit={handleSessionComplete}
        habitName={habit.name}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },

  // Status Hero Card
  statusCard: {
    padding: 24,
  },
  statusCardPending: {
    backgroundColor: Colors.white,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  statusCardComplete: {
    backgroundColor: Colors.primaryTint,
    borderLeftWidth: 4,
    borderLeftColor: Colors.success,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 16,
  },
  statusIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  statusSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  streakContainer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 16,
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.accentSoft,
    padding: 16,
    borderRadius: 12,
    gap: 10,
  },
  streakNumber: {
    fontSize: 40,
    fontWeight: "700",
    color: Colors.accentText,
    lineHeight: 44,
  },
  streakLabel: {
    fontSize: 16,
    color: Colors.accentText,
    fontWeight: "500",
  },
  quickStatsRow: {
    flexDirection: "row",
    gap: 12,
  },
  quickStat: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickStatValue: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: 4,
  },
  quickStatLabel: {
    fontSize: 12,
    color: Colors.textMuted,
  },

  // Action Buttons
  primaryActionButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    gap: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  primaryActionButtonComplete: {
    backgroundColor: Colors.primarySoft,
  },
  primaryActionButtonText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: "600",
  },
  primaryActionButtonTextComplete: {
    color: Colors.textFaint,
  },
  secondaryActionButton: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  secondaryActionButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },

  // Card Elements
  motivationCard: {
    backgroundColor: Colors.primaryTint,
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  motivationText: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
    fontStyle: "italic",
  },

  // Stats Grid
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statBox: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: Colors.primaryTint,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    gap: 4,
  },
  statIcon: {
    marginBottom: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: "center",
  },
  // Progress Bars
  progressSection: {
    gap: 16,
    marginTop: 4,
  },
  progressItem: {
    gap: 6,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  progressPercentage: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "700",
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: Colors.primarySoft,
    borderRadius: 999,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: Colors.primaryBright,
    borderRadius: 999,
  },
  durationStats: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 8,
  },
  durationText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },

  // Goal Met Notice
  goalMetNotice: {
    fontSize: 14,
    color: Colors.success,
    backgroundColor: Colors.primaryTint,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    lineHeight: 20,
  },

  // Goal
  goalText: {
    fontSize: 18,
    color: Colors.textPrimary,
    fontWeight: "600",
  },
  goalSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
  },

  // Freeze
  freezeText: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 6,
  },
  freezeSubtext: {
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: 14,
  },
  freezeCountContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.accentSoft,
    paddingVertical: 10,
    borderRadius: 8,
  },
  freezeCountText: {
    fontSize: 14,
    color: Colors.accentText,
    fontWeight: "600",
  },

  // Calendar
  calendarNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  // Journal
  journalEntry: {
    backgroundColor: Colors.primaryTint,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: Colors.warning,
  },
  journalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  journalDate: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.primary,
  },
  ratingDisplay: {
    flexDirection: "row",
    gap: 2,
  },
  journalNote: {
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
  },

  // Empty States
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
  },

  // Edit Button
  buttonDisabled: {
    opacity: 0.5,
  },
  editButton: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.primary,
    marginBottom: 32,
    gap: 8,
  },
  editButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
});
