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
} from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import useGetHabit from "@/hooks/habits/useGetHabit";
import useUpdateHabit from "@/hooks/habits/useUpdateHabit";
import { HabitType, HabitPeriod } from "@/types/habits";
import SegmentedControl from "@/components/SegmentedControl";
import WeekdaySelector from "@/components/WeekdaySelector";

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

  useEffect(() => {
    if (habit) {
      setTitle(habit.name);
      setDescription(habit.motivation_note || "");
      setHabitType(habit.habit_type);
      setPeriod(habit.period);
      setTargetCount(habit.target_count.toString());
      setDurationMinutes(habit.target_duration_minutes ? habit.target_duration_minutes.toString() : "");
      setStartedOn(habit.started_on || "");
    }
  }, [habit]);

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

    if (startedOn.trim() && !/^\d{4}-\d{2}-\d{2}$/.test(startedOn.trim())) {
      Alert.alert("Error", "Start date must be in YYYY-MM-DD format");
      return;
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
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="close" size={28} color="#007AFF" />
            </TouchableOpacity>
          ),
        }}
      />
      {fetchLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : fetchError || !habit ? (
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>{fetchError || "Habit not found"}</Text>
        </View>
      ) : (
        <ScrollView style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Morning Run"
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="What's the goal of this habit?"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
            />

            <Text style={styles.label}>Habit Type</Text>
            <SegmentedControl options={HABIT_TYPE_OPTIONS} value={habitType} onChange={setHabitType} />

            <Text style={styles.label}>Period</Text>
            <SegmentedControl options={PERIOD_OPTIONS} value={period} onChange={setPeriod} />

            <Text style={styles.label}>Target Count ({frequencyLabel(period)})</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 3"
              value={targetCount}
              onChangeText={setTargetCount}
              keyboardType="number-pad"
            />

            {habitType === HabitType.LOG && (
              <>
                <Text style={styles.label}>Target Duration (minutes, optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 20"
                  value={durationMinutes}
                  onChangeText={setDurationMinutes}
                  keyboardType="number-pad"
                />
              </>
            )}

            <Text style={styles.label}>Start Date (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={startedOn}
              onChangeText={setStartedOn}
            />

            <Text style={styles.label}>Schedule Days (optional)</Text>
            <WeekdaySelector selectedDays={scheduleDays} onChange={setScheduleDays} />

            <TouchableOpacity
              style={[styles.button, saveLoading && styles.buttonDisabled]}
              onPress={handleSaveHabit}
              disabled={saveLoading}
            >
              {saveLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
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
  emptyText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 16,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  textArea: {
    height: 100,
    paddingTop: 12,
    textAlignVertical: "top",
  },
  button: {
    width: "100%",
    height: 50,
    backgroundColor: "#007AFF",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
