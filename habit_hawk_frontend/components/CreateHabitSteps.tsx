import React, { useState } from "react";
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
}

const CreateHabitSteps: React.FC<CreateHabitStepsProps> = ({
  onComplete,
  onCancel,
  loading = false,
}) => {
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

  const totalSteps = habitType === HabitType.LOG ? 7 : 6;

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
    if (currentStep === 5 && habitType === HabitType.REMINDER) {
      // Skip duration step for reminder type
      setCurrentStep(6);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    animateTransition("back");
    if (currentStep === 6 && habitType === HabitType.REMINDER) {
      // Skip duration step when going back
      setCurrentStep(4);
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

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
      startDate.trim();

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
    };
    onComplete(data);
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
            <Text style={styles.stepIcon}>📊</Text>
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
                  Just mark it complete when done. Perfect for quick habits.
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
                  Track duration with a built-in timer. Great for focused activities.
                </Text>
              </View>
              {habitType === HabitType.LOG && (
                <Ionicons name="checkmark-circle-outline" size={24} color={Colors.primary} />
              )}
            </TouchableOpacity>
          </View>
        )}

        {currentStep === 4 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepIcon}>📅</Text>
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

        {currentStep === 5 && habitType === HabitType.LOG && (
          <View style={styles.stepContent}>
            <Ionicons name="timer-outline" size={64} color={Colors.primary} style={styles.stepIconMargin} />
            <Text style={styles.stepQuestion}>
              How long should each session be?
            </Text>
            <Text style={styles.helper}>
              This is optional - you can set a target duration
            </Text>

            <TextInput
              style={styles.largeInput}
              placeholder="e.g., 30"
              value={durationMinutes}
              onChangeText={setDurationMinutes}
              keyboardType="number-pad"
              maxLength={4}
            />
            <Text style={styles.helperSmall}>minutes per session</Text>

            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => setDurationMinutes("")}
            >
              <Text style={styles.skipButtonText}>Skip - I'll track manually</Text>
            </TouchableOpacity>
          </View>
        )}

        {currentStep === (habitType === HabitType.LOG ? 6 : 6) && (
          <View style={styles.stepContent}>
            <Text style={styles.stepIcon}>📆</Text>
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
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={startDate}
              onChangeText={setStartDate}
              maxLength={10}
            />
            <Text style={styles.helperSmall}>
              Leave blank to start today
            </Text>
          </View>
        )}

        {currentStep === (habitType === HabitType.LOG ? 7 : 7) && (
          <View style={styles.stepContent}>
            <Ionicons name="checkmark-circle-outline" size={64} color={Colors.success} style={styles.stepIconMargin} />
            <Text style={styles.stepQuestion}>Review your habit</Text>

            <View style={styles.reviewCard}>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Name:</Text>
                <Text style={styles.reviewValue}>{name}</Text>
              </View>
              {motivationNote && (
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>Why:</Text>
                  <Text style={styles.reviewValue}>{motivationNote}</Text>
                </View>
              )}
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Type:</Text>
                <Text style={styles.reviewValue}>
                  {habitType === HabitType.REMINDER ? "Simple Reminder" : "Timed Session"}
                </Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Frequency:</Text>
                <Text style={styles.reviewValue}>
                  {targetCount} time{parseInt(targetCount) > 1 ? "s" : ""} {frequencyLabel(period)}
                </Text>
              </View>
              {habitType === HabitType.LOG && durationMinutes && (
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>Duration:</Text>
                  <Text style={styles.reviewValue}>{durationMinutes} minutes</Text>
                </View>
              )}
              {scheduleDays.length > 0 && (
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>Days:</Text>
                  <Text style={styles.reviewValue}>
                    {scheduleDays.length} day{scheduleDays.length > 1 ? "s" : ""} selected
                  </Text>
                </View>
              )}
            </View>

            <Text style={styles.helperCenter}>
              Ready to start building this habit?
            </Text>
          </View>
        )}
      </Animated.View>
    );

    return stepContent;
  };

  const isLastStep =
    currentStep === (habitType === HabitType.LOG ? 7 : 7) ||
    (currentStep === 6 && habitType === HabitType.REMINDER);

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
            <Ionicons name="close-outline" size={20} color={Colors.error} />
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
          <Text style={styles.nextButtonText}>
            {loading ? "Creating..." : isLastStep ? "Create Habit" : "Next"}
          </Text>
          {!loading && !isLastStep && (
            <Ionicons name="arrow-forward-outline" size={20} color={Colors.white} />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

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
    borderWidth: 2,
    borderColor: Colors.error,
    backgroundColor: Colors.white,
    gap: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.error,
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
    opacity: 0.5,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.white,
  },
});

export default CreateHabitSteps;
