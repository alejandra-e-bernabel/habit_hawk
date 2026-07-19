import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { getIconByName } from "@/constants/HabitIcons";

interface HabitBreakdownRowProps {
  iconName: string | null;
  habitName: string;
  completedCount: number;
  totalDue: number;
}

export default function HabitBreakdownRow({
  iconName,
  habitName,
  completedCount,
  totalDue,
}: HabitBreakdownRowProps) {
  const icon = getIconByName(iconName);
  const progress = totalDue > 0 ? (completedCount / totalDue) * 100 : 0;
  const isComplete = completedCount === totalDue && totalDue > 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon.ionicon as any} size={18} color={Colors.primary} />
        </View>
        <Text style={styles.name} numberOfLines={1}>
          {habitName}
        </Text>
        <Text style={[styles.count, isComplete && styles.countComplete]}>
          {completedCount} of {totalDue}
        </Text>
      </View>
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${Math.min(progress, 100)}%`,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 10,
  },
  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.primaryTint,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    flex: 1,
    fontSize: 13,
    fontWeight: "500",
    color: Colors.textPrimary,
  },
  count: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: "400",
  },
  countComplete: {
    color: Colors.accentText,
    fontWeight: "600",
  },
  progressTrack: {
    height: 6,
    backgroundColor: Colors.primarySoft,
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primaryBright,
    borderRadius: 999,
  },
});
