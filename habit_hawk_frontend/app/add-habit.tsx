import React, { useRef } from "react";
import { Stack, router } from "expo-router";
import { TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import useCreateHabit from "@/hooks/habits/useCreateHabit";
import CreateHabitSteps, { HabitFormData, CreateHabitStepsRef } from "@/components/CreateHabitSteps";

export default function AddHabit() {
  const { createHabit, loading, error } = useCreateHabit();
  const createHabitRef = useRef<CreateHabitStepsRef>(null);

  const handleComplete = async (data: HabitFormData) => {
    try {
      await createHabit(data);
      router.back();
    } catch {
      Alert.alert("Failed to Add Habit", error || "Please try again");
    }
  };

  const handleCancel = () => {
    createHabitRef.current?.handleCancel();
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Create New Habit",
          presentation: "modal",
          headerLeft: () => (
            <TouchableOpacity onPress={handleCancel}>
              <Ionicons name="close-outline" size={28} color={Colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      <CreateHabitSteps
        ref={createHabitRef}
        onComplete={handleComplete}
        onCancel={() => router.back()}
        loading={loading}
      />
    </>
  );
}
