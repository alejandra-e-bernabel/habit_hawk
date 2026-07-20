import React, { useState, useEffect } from "react";

import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import useGetHabit from "@/hooks/habits/useGetHabit";
import useUpdateHabit from "@/hooks/habits/useUpdateHabit";
import { HabitType, HabitPeriod } from "@/types/habits";
import SegmentedControl from "@/components/SegmentedControl";
import WeekdaySelector from "@/components/WeekdaySelector";
import DateTimePicker from "@react-native-community/datetimepicker";

const HABIT_TYPE_OPTIONS = [
  { label: "Reminder", value: HabitType.REMINDER },
  { label: "Log (with duration)", value: HabitType.LOG },
];

const PERIOD_OPTIONS = [
  { label: "Daily", value: HabitPeriod.DAILY },
  { label: "Weekly", value: HabitPeriod.WEEKLY },
  { label: "Monthly", value: HabitPeriod.MONTHLY },
];

function frequencyLabel(period: HabitPeriod) {
  switch (period) {
    case HabitPeriod.DAILY:
      return "time(s) per day";
    case HabitPeriod.MONTHLY:
      return "time(s) per month";
    default:
      return "time(s) per week";
  }
}

export default function EditHabit() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const habitId = Number(id);
  const { habit, loading: fetchLoading, error: fetchError } = useGetHabit(habitId);
  const { updateHabit, loading: saveLoading, error: saveError } = useUpdateHabit();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [habitType, setHabitType] = useState<HabitType>(HabitType.REMINDER);
  const [period, setPeriod] = useState<HabitPeriod>(HabitPeriod.DAILY);
  const [targetCount, setTargetCount] = useState("1");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [startedOn, setStartedOn] = useState("");
  const [scheduleDays, setScheduleDays] = useState<number[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    if (habit) {
      setTitle(habit.name);
      setDescription(habit.motivation_note || "");
      setHabitType(habit.habit_type);
      setPeriod(habit.period);
      setTargetCount(habit.target_count.toString());
      setDurationMinutes(habit.target_duration_minutes ? habit.target_duration_minutes.toString() : "");
      setStartedOn(habit.started_on || "");

      // Set the selected date if started_on exists
      if (habit.started_on) {
        setSelectedDate(new Date(habit.started_on));
      }
    }
  }, [habit]);

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (date) {
      setSelectedDate(date);
      const formattedDate = date.toISOString().split("T")[0];
      setStartedOn(formattedDate);
    }
  };

  const handleSaveHabit = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a habit title");
      return;
    }

    const targetCountNum = parseInt(targetCount, 10);
    if (!targetCount || isNaN(targetCountNum) || targetCountNum < 1) {
      Alert.alert("Error", `Please enter a valid target count (${frequencyLabel(period)})`);
      return;
    }

    let durationNum: number | undefined;
    if (habitType === HabitType.LOG && durationMinutes.trim()) {
      durationNum = parseInt(durationMinutes, 10);
      if (isNaN(durationNum) || durationNum < 1) {
        Alert.alert("Error", "Please enter a valid target duration (minutes)");
        return;
      }
    }

    try {
      await updateHabit(habitId, {
        name: title.trim(),
        motivation_note: description.trim() || null,
        habit_type: habitType,
        period,
        target_count: targetCountNum,
        target_duration_minutes: durationNum,
        started_on: startedOn.trim() || undefined,
        schedule_days: scheduleDays.length > 0 ? scheduleDays : undefined,
      });

      router.back();
    } catch {
      Alert.alert("Failed to Save Habit", saveError || "Please try again");
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Edit Habit",
          presentation: "modal",
          headerShown: false,
        }}
      />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Edit Habit</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <Ionicons name="close-outline" size={28} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        {fetchLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : fetchError || !habit ? (
          <View style={styles.centered}>
            <Ionicons name="alert-circle-outline" size={64} color={Colors.textTertiary} />
            <Text style={styles.emptyText}>{fetchError || "Habit not found"}</Text>
          </View>
        ) : (
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
              {/* Basic Info Card */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Ionicons name="flag-outline" size={24} color={Colors.primary} />
                  <Text style={styles.cardTitle}>Basic Information</Text>
                </View>

                <Text style={styles.label}>Habit Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Morning Meditation"
                  placeholderTextColor={Colors.textTertiary}
                  value={title}
                  onChangeText={setTitle}
                />

                <Text style={styles.label}>Motivation</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Why is this habit important to you?"
                  placeholderTextColor={Colors.textTertiary}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={4}
                />
              </View>

              {/* Tracking Settings Card */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Ionicons name="stats-chart-outline" size={24} color={Colors.primary} />
                  <Text style={styles.cardTitle}>Tracking Settings</Text>
                </View>

                <Text style={styles.label}>Habit Type</Text>
                <SegmentedControl options={HABIT_TYPE_OPTIONS} value={habitType} onChange={setHabitType} />

                <Text style={styles.label}>Frequency</Text>
                <SegmentedControl options={PERIOD_OPTIONS} value={period} onChange={setPeriod} />

                <Text style={styles.label}>Target Count</Text>
                <Text style={styles.helperText}>{frequencyLabel(period)}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 3"
                  placeholderTextColor={Colors.textTertiary}
                  value={targetCount}
                  onChangeText={setTargetCount}
                  keyboardType="number-pad"
                />
              </View>

              {/* Advanced Settings Card */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Ionicons name="options-outline" size={24} color={Colors.primary} />
                  <Text style={styles.cardTitle}>Advanced Settings</Text>
                </View>

                {habitType === HabitType.LOG && (
                  <>
                    <Text style={styles.label}>Target Duration (optional)</Text>
                    <Text style={styles.helperText}>Minutes per session</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g., 30"
                      placeholderTextColor={Colors.textTertiary}
                      value={durationMinutes}
                      onChangeText={setDurationMinutes}
                      keyboardType="number-pad"
                    />
                  </>
                )}

                <Text style={styles.label}>Start Date (optional)</Text>
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
                  <Text style={[styles.datePickerText, !startedOn && styles.datePickerPlaceholder]}>
                    {startedOn ? new Date(startedOn).toLocaleDateString() : "Select start date"}
                  </Text>
                </TouchableOpacity>
                {startedOn && (
                  <TouchableOpacity
                    onPress={() => setStartedOn("")}
                    style={styles.clearDateButton}
                  >
                    <Text style={styles.clearDateText}>Clear date (start today)</Text>
                  </TouchableOpacity>
                )}
                {showDatePicker && (
                  <DateTimePicker
                    value={startedOn ? new Date(startedOn) : selectedDate}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={handleDateChange}
                  />
                )}

                {period === HabitPeriod.WEEKLY && (
                  <>
                    <Text style={styles.label}>Schedule Days (optional)</Text>
                    <Text style={styles.helperText}>Select which days you'll do this habit</Text>
                    <WeekdaySelector selectedDays={scheduleDays} onChange={setScheduleDays} />
                  </>
                )}
              </View>

              {/* Save Button */}
              <TouchableOpacity
                style={[styles.saveButton, saveLoading && styles.buttonDisabled]}
                onPress={handleSaveHabit}
                disabled={saveLoading}
              >
                {saveLoading ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle-outline" size={24} color={Colors.white} />
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.card,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    backgroundColor: Colors.background,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 16,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
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
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 8,
    marginTop: 8,
  },
  helperText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 8,
    marginTop: -4,
  },
  input: {
    width: "100%",
    fontSize: 16,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    backgroundColor: Colors.card,
  },
  textArea: {
    height: 120,
    paddingTop: 14,
    textAlignVertical: "top",
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    gap: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: "700",
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    gap: 12,
  },
  datePickerText: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
  datePickerPlaceholder: {
    color: Colors.textTertiary,
  },
  clearDateButton: {
    alignSelf: "flex-start",
    marginBottom: 12,
    marginTop: -8,
  },
  clearDateText: {
    fontSize: 14,
    color: Colors.primary,
    textDecorationLine: "underline",
  },
});
