import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface WeekdaySelectorProps {
  selectedDays: number[];
  onChange: (days: number[]) => void;
}

export default function WeekdaySelector({ selectedDays, onChange }: WeekdaySelectorProps) {
  const toggleDay = (day: number) => {
    if (selectedDays.includes(day)) {
      onChange(selectedDays.filter((d) => d !== day));
    } else {
      onChange([...selectedDays, day].sort());
    }
  };

  return (
    <View style={styles.row}>
      {WEEKDAY_LABELS.map((label, day) => {
        const selected = selectedDays.includes(day);
        return (
          <TouchableOpacity
            key={day}
            style={[styles.dayChip, selected && styles.dayChipSelected]}
            onPress={() => toggleDay(day)}
          >
            <Text style={[styles.dayText, selected && styles.dayTextSelected]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  dayChip: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  dayChipSelected: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  dayText: {
    fontSize: 12,
    color: "#333",
  },
  dayTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
});
