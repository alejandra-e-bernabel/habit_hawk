import React, { useState, forwardRef, useImperativeHandle } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Alert,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { HabitType, HabitPeriod } from "@/types/habits";
import ProgressBar from "./ProgressBar";
import WeekdaySelector from "./WeekdaySelector";
import IconSelector from "./IconSelector";
import { Colors } from "@/constants/Colors";

interface CreateHabitStepsProps {
  onComplete: (data: HabitFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export interface CreateHabitStepsRef {
  handleCancel: () => void;
}

export interface HabitFormData {
  name: string;
  motivation_note?: string | null;
  icon_name?: string | null;
  habit_type: HabitType;
  period: HabitPeriod;
  target_count: number;
  target_duration_minutes?: number | null;
  started_on?: string | null;
  schedule_days?: number[] | null;
  reminders?: Array<{ remind_at: string; is_enabled: boolean }> | null;
}

const CreateHabitSteps = forwardRef<CreateHabitStepsRef, CreateHabitStepsProps>(({
  onComplete,
  onCancel,
  loading = false,
}, ref) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [slideAnim] = useState(new Animated.Value(0));

  // Form state
  const [name, setName] = useState("");
  const [motivationNote, setMotivationNote] = useState("");
  const [iconName, setIconName] = useState<string | null>(null);
  const [habitType, setHabitType] = useState<HabitType>(HabitType.REMINDER);
  const [period, setPeriod] = useState<HabitPeriod>(HabitPeriod.DAILY);
  const [targetCount, setTargetCount] = useState("1");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [scheduleDays, setScheduleDays] = useState<number[]>([]);
  const [startDate, setStartDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [reminders, setReminders] = useState<Array<{ remind_at: string; is_enabled: boolean }>>([]);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [activeReminderIndex, setActiveReminderIndex] = useState<number | null>(null);

  const totalSteps = 6;

  const handleCancel = () => {
    // Check if user has entered any data
    const hasData =
      name.trim() ||
      motivationNote.trim() ||
      iconName !== null ||
      habitType !== HabitType.REMINDER ||
      period !== HabitPeriod.DAILY ||
      targetCount !== "1" ||
      durationMinutes.trim() ||
      scheduleDays.length > 0 ||
      startDate.trim() ||
      reminders.length > 0;

    if (hasData) {
      Alert.alert(
        "Discard Changes?",
        "Are you sure you want to cancel? Your progress will be lost.",
        [
          {
            text: "Keep Editing",
            style: "cancel",
          },
          {
            text: "Discard",
            style: "destructive",
            onPress: onCancel,
          },
        ]
      );
    } else {
      onCancel();
    }
  };

  useImperativeHandle(ref, () => ({
    handleCancel,
  }));

  const animateTransition = (direction: "next" | "back") => {
    const toValue = direction === "next" ? -50 : 50;
    Animated.sequence([
      Animated.timing(slideAnim, {
        toValue,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleNext = () => {
    // Validation for each step
    if (currentStep === 1 && !name.trim()) {
      return;
    }
    if (currentStep === 4) {
      const count = parseInt(targetCount, 10);
      if (!targetCount || isNaN(count) || count < 1) {
        return;
      }
    }

    animateTransition("next");
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    animateTransition("back");
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = () => {
    const data: HabitFormData = {
      name: name.trim(),
      motivation_note: motivationNote.trim() || null,
      icon_name: iconName,
      habit_type: habitType,
      period,
      target_count: parseInt(targetCount, 10),
      target_duration_minutes:
        habitType === HabitType.LOG && durationMinutes
          ? parseInt(durationMinutes, 10)
          : null,
      started_on: startDate.trim() || null,
      schedule_days: scheduleDays.length > 0 ? scheduleDays : null,
      reminders: reminders.length > 0 ? reminders : null,
    };
    onComplete(data);
  };

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (date) {
      setSelectedDate(date);
      const formattedDate = date.toISOString().split("T")[0];
      setStartDate(formattedDate);
    }
  };

  const handleTimeChange = (event: any, time?: Date) => {
    setShowTimePicker(Platform.OS === "ios");
    if (time && activeReminderIndex !== null) {
      const hours = time.getHours().toString().padStart(2, "0");
      const minutes = time.getMinutes().toString().padStart(2, "0");
      const timeString = `${hours}:${minutes}`;
      const updated = [...reminders];
      updated[activeReminderIndex].remind_at = timeString;
      setReminders(updated);
      setActiveReminderIndex(null);
    }
  };

  const frequencyLabel = (p: HabitPeriod) => {
    switch (p) {
      case HabitPeriod.DAILY:
        return "per day";
      case HabitPeriod.MONTHLY:
        return "per month";
      default:
        return "per week";
    }
  };

  const renderStep = () => {
    const stepContent = (
      <Animated.View
        style={[
          styles.stepContainer,
          { transform: [{ translateX: slideAnim }] },
        ]}
      >
        {currentStep === 1 && (
          <View style={styles.stepContent}>
            <Ionicons name="flag-outline" size={64} color={Colors.primary} style={styles.stepIconMargin} />
            <Text style={styles.stepQuestion}>
              What habit do you want to build?
            </Text>
            <TextInput
              style={styles.largeInput}
              placeholder="e.g., Morning Meditation"
              value={name}
              onChangeText={setName}
              autoFocus
              maxLength={120}
            />
            <Text style={styles.helper}>Give your habit a clear, memorable name</Text>

            <Text style={[styles.stepQuestion, styles.secondaryQuestion]}>
              Why is this important to you?
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Your motivation helps you stay committed..."
              value={motivationNote}
              onChangeText={setMotivationNote}
              multiline
              numberOfLines={4}
              maxLength={1000}
            />
          </View>
        )}

        {currentStep === 2 && (
          <View style={styles.stepContent}>
            <Ionicons name="apps-outline" size={64} color={Colors.primary} style={styles.stepIconMargin} />
            <Text style={styles.stepQuestion}>
              Choose an icon for your habit
            </Text>
            <Text style={styles.helper}>
              Pick an icon that represents your habit (optional)
            </Text>
            <IconSelector
              selectedIcon={iconName}
              onSelectIcon={setIconName}
            />
          </View>
        )}

        {currentStep === 3 && (
          <View style={styles.stepContent}>
            <Ionicons name="stats-chart-outline" size={64} color={Colors.primary} style={styles.stepIconMargin} />
            <Text style={styles.stepQuestion}>
              How do you want to track it?
            </Text>

            <TouchableOpacity
              style={[
                styles.card,
                habitType === HabitType.REMINDER && styles.cardSelected,
              ]}
              onPress={() => setHabitType(HabitType.REMINDER)}
            >
              <View style={styles.cardIcon}>
                <Ionicons
                  name="notifications-outline"
                  size={32}
                  color={
                    habitType === HabitType.REMINDER ? Colors.primary : Colors.textSecondary
                  }
                />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Simple Reminder</Text>
                <Text style={styles.cardDescription}>
                  Mark it complete when done.
                </Text>
              </View>
              {habitType === HabitType.REMINDER && (
                <Ionicons name="checkmark-circle-outline" size={24} color={Colors.primary} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.card,
                habitType === HabitType.LOG && styles.cardSelected,
              ]}
              onPress={() => setHabitType(HabitType.LOG)}
            >
              <View style={styles.cardIcon}>
                <Ionicons
                  name="timer-outline"
                  size={32}
                  color={habitType === HabitType.LOG ? Colors.primary : Colors.textSecondary}
                />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Timed Session</Text>
                <Text style={styles.cardDescription}>
                  Track duration with a timer.
                </Text>
              </View>
              {habitType === HabitType.LOG && (
                <Ionicons name="checkmark-circle-outline" size={24} color={Colors.primary} />
              )}
            </TouchableOpacity>

            {habitType === HabitType.LOG && (
              <View style={styles.conditionalField}>
                <Text style={styles.label}>Target duration (minutes):</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 30"
                  value={durationMinutes}
                  onChangeText={setDurationMinutes}
                  keyboardType="number-pad"
                  maxLength={4}
                />
                <Text style={styles.helperSmall}>Optional - set a target duration</Text>
              </View>
            )}
          </View>
        )}

        {currentStep === 4 && (
          <View style={styles.stepContent}>
            <Ionicons name="calendar-outline" size={64} color={Colors.primary} style={styles.stepIconMargin} />
            <Text style={styles.stepQuestion}>How often will you do this?</Text>

            <View style={styles.periodSelector}>
              {[
                { label: "Daily", value: HabitPeriod.DAILY, icon: "today-outline" },
                { label: "Weekly", value: HabitPeriod.WEEKLY, icon: "calendar-outline" },
                { label: "Monthly", value: HabitPeriod.MONTHLY, icon: "calendar-outline" },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.periodCard,
                    period === option.value && styles.periodCardSelected,
                  ]}
                  onPress={() => setPeriod(option.value)}
                >
                  <Ionicons
                    name={option.icon as any}
                    size={28}
                    color={period === option.value ? Colors.primary : Colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.periodLabel,
                      period === option.value && styles.periodLabelSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>
              How many times {frequencyLabel(period)}?
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 3"
              value={targetCount}
              onChangeText={setTargetCount}
              keyboardType="number-pad"
              maxLength={2}
            />
          </View>
        )}

        {currentStep === 5 && (
          <View style={styles.stepContent}>
            <Ionicons name="alarm-outline" size={64} color={Colors.primary} style={styles.stepIconMargin} />
            <Text style={styles.stepQuestion}>
              When should we remind you?
            </Text>
            <Text style={styles.helper}>Optional</Text>

            <View style={styles.remindersList}>
              {reminders.map((reminder, index) => (
                <View key={index} style={styles.reminderRow}>
                  <Ionicons name="time-outline" size={24} color={Colors.primary} />
                  <TouchableOpacity
                    style={styles.reminderInput}
                    onPress={() => {
                      setActiveReminderIndex(index);
                      setShowTimePicker(true);
                    }}
                  >
                    <Text style={[styles.reminderInputText, !reminder.remind_at && styles.reminderInputPlaceholder]}>
                      {reminder.remind_at || "Select time"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      const updated = [...reminders];
                      updated[index].is_enabled = !updated[index].is_enabled;
                      setReminders(updated);
                    }}
                  >
                    <Ionicons
                      name={reminder.is_enabled ? "toggle" : "toggle-outline"}
                      size={32}
                      color={reminder.is_enabled ? Colors.primary : Colors.textSecondary}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setReminders(reminders.filter((_, i) => i !== index));
                    }}
                  >
                    <Ionicons name="close-circle-outline" size={24} color={Colors.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {showTimePicker && (
              <DateTimePicker
                value={new Date()}
                mode="time"
                is24Hour={false}
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={handleTimeChange}
              />
            )}

            <TouchableOpacity
              style={styles.addReminderButton}
              onPress={() => {
                setReminders([...reminders, { remind_at: "", is_enabled: true }]);
              }}
            >
              <Ionicons name="add-outline" size={20} color={Colors.primary} />
              <Text style={styles.addReminderText}>Add reminder</Text>
            </TouchableOpacity>
          </View>
        )}

        {currentStep === 6 && (
          <View style={styles.stepContent}>
            <Ionicons name="calendar-number-outline" size={64} color={Colors.primary} style={styles.stepIconMargin} />
            <Text style={styles.stepQuestion}>
              Which days will you do this?
            </Text>
            <Text style={styles.helper}>Optional - helps with planning</Text>

            {period === HabitPeriod.WEEKLY && (
              <>
                <Text style={styles.label}>Select specific days:</Text>
                <WeekdaySelector
                  selectedDays={scheduleDays}
                  onChange={setScheduleDays}
                />
              </>
            )}

            <Text style={styles.label}>
              Start date (optional):
            </Text>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
              <Text style={[styles.datePickerText, !startDate && styles.datePickerPlaceholder]}>
                {startDate ? new Date(startDate).toLocaleDateString() : "Select start date"}
              </Text>
            </TouchableOpacity>
            {startDate && (
              <TouchableOpacity
                onPress={() => setStartDate("")}
                style={styles.clearDateButton}
              >
                <Text style={styles.clearDateText}>Clear date (start today)</Text>
              </TouchableOpacity>
            )}
            {showDatePicker && (
              <DateTimePicker
                value={startDate ? new Date(startDate) : selectedDate}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={handleDateChange}
              />
            )}
          </View>
        )}

      </Animated.View>
    );

    return stepContent;
  };

  const isLastStep = currentStep === 6;

  const canProceed = () => {
    if (currentStep === 1) return name.trim().length > 0;
    if (currentStep === 4) {
      const count = parseInt(targetCount, 10);
      return !isNaN(count) && count >= 1;
    }
    return true;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
        {renderStep()}
      </ScrollView>

      <View style={styles.navigation}>
        {currentStep > 1 ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            disabled={loading}
          >
            <Ionicons name="arrow-back-outline" size={20} color={Colors.primary} />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
            disabled={loading}
          >
            <Ionicons name="close-outline" size={20} color={Colors.textSecondary} />
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.nextButton,
            (!canProceed() || loading) && styles.nextButtonDisabled,
          ]}
          onPress={isLastStep ? handleSubmit : handleNext}
          disabled={!canProceed() || loading}
        >
          <Text style={[
            styles.nextButtonText,
            (!canProceed() || loading) && styles.nextButtonTextDisabled,
          ]}>
            {loading ? "Creating..." : isLastStep ? "Create Habit" : "Next"}
          </Text>
          {!loading && !isLastStep && (
            <Ionicons
              name="arrow-forward-outline"
              size={20}
              color={(!canProceed() || loading) ? Colors.textTertiary : Colors.white}
            />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
});

CreateHabitSteps.displayName = "CreateHabitSteps";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  stepContainer: {
    minHeight: 400,
  },
  stepContent: {
    alignItems: "center",
  },
  stepIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  stepIconMargin: {
    marginBottom: 16,
  },
  stepQuestion: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.textPrimary,
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  secondaryQuestion: {
    fontSize: 20,
    marginTop: 32,
    marginBottom: 16,
  },
  helper: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  helperSmall: {
    fontSize: 13,
    color: Colors.textTertiary,
    marginTop: 8,
  },
  helperCenter: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 24,
    fontStyle: "italic",
  },
  largeInput: {
    width: "100%",
    fontSize: 20,
    fontWeight: "600",
    color: Colors.textPrimary,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    backgroundColor: Colors.white,
    textAlign: "center",
  },
  input: {
    width: "100%",
    fontSize: 16,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 14,
    backgroundColor: Colors.white,
    marginBottom: 12,
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
    textAlign: "left",
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 12,
    alignSelf: "flex-start",
    width: "100%",
  },
  card: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  cardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLightest,
  },
  cardIcon: {
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  periodSelector: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 32,
    width: "100%",
  },
  periodCard: {
    flex: 1,
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  periodCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLightest,
  },
  periodLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginTop: 8,
  },
  periodLabelSelected: {
    color: Colors.primary,
  },
  skipButton: {
    marginTop: 16,
    padding: 12,
  },
  skipButtonText: {
    fontSize: 15,
    color: Colors.textSecondary,
    textDecorationLine: "underline",
  },
  reviewCard: {
    width: "100%",
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  reviewRow: {
    marginBottom: 16,
  },
  reviewLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  reviewValue: {
    fontSize: 16,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  navigation: {
    flexDirection: "row",
    padding: 20,
    paddingBottom: 32,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 12,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
    gap: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary,
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    gap: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  nextButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    gap: 8,
  },
  nextButtonDisabled: {
    backgroundColor: Colors.primaryLightest,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.white,
  },
  nextButtonTextDisabled: {
    color: Colors.textTertiary,
  },
  conditionalField: {
    width: "100%",
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  remindersList: {
    width: "100%",
    marginBottom: 16,
  },
  reminderRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  reminderInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 10,
    backgroundColor: Colors.white,
    justifyContent: "center",
  },
  reminderInputText: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
  reminderInputPlaceholder: {
    color: Colors.textTertiary,
  },
  addReminderButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: "dashed",
    backgroundColor: Colors.white,
    gap: 8,
    marginTop: 8,
  },
  addReminderText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.primary,
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 14,
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
  },
  clearDateText: {
    fontSize: 14,
    color: Colors.primary,
    textDecorationLine: "underline",
  },
});

export default CreateHabitSteps;
