import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { HabitLogResponse } from "@/types/habits";
import { LogStatus } from "@/types/habits";

interface HabitCalendarProps {
  logs: HabitLogResponse[];
  year: number;
  month: number; // 0-indexed (0 = January)
}

const HabitCalendar: React.FC<HabitCalendarProps> = ({ logs, year, month }) => {
  // Get days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday

  // Create a map of dates to log status
  const logMap = new Map<string, LogStatus>();
  logs.forEach((log) => {
    const logDate = new Date(log.logged_for_date);
    if (logDate.getFullYear() === year && logDate.getMonth() === month) {
      const dateKey = logDate.getDate().toString();
      logMap.set(dateKey, log.status);
    }
  });

  // Build calendar grid
  const weeks: (number | null)[][] = [];
  let currentWeek: (number | null)[] = new Array(7).fill(null);

  // Fill in the days
  let dayCounter = 1;
  for (let week = 0; week < 6; week++) {
    for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
      if (week === 0 && dayOfWeek < firstDayOfMonth) {
        currentWeek[dayOfWeek] = null;
      } else if (dayCounter <= daysInMonth) {
        currentWeek[dayOfWeek] = dayCounter;
        dayCounter++;
      } else {
        currentWeek[dayOfWeek] = null;
      }
    }
    weeks.push([...currentWeek]);
    currentWeek = new Array(7).fill(null);

    if (dayCounter > daysInMonth) break;
  }

  const getColorForStatus = (status: LogStatus | undefined): string => {
    if (!status) return "#F5F5F5"; // No action

    switch (status) {
      case LogStatus.COMPLETED:
        return "#51CF66"; // Green
      case LogStatus.INCOMPLETE:
        return "#FF6B6B"; // Red
      case LogStatus.SKIPPED:
        return "#FFD93D"; // Yellow
      case LogStatus.FROZEN:
        return "#4DABF7"; // Blue
      default:
        return "#F5F5F5";
    }
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <View style={styles.container}>
      <Text style={styles.monthTitle}>{monthNames[month]} {year}</Text>

      {/* Day headers */}
      <View style={styles.weekRow}>
        {dayNames.map((dayName, idx) => (
          <View key={idx} style={styles.dayHeader}>
            <Text style={styles.dayHeaderText}>{dayName}</Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      {weeks.map((week, weekIdx) => (
        <View key={weekIdx} style={styles.weekRow}>
          {week.map((day, dayIdx) => {
            const status = day ? logMap.get(day.toString()) : undefined;
            const backgroundColor = day ? getColorForStatus(status) : "transparent";

            return (
              <View
                key={dayIdx}
                style={[
                  styles.dayCell,
                  { backgroundColor }
                ]}
              >
                {day && (
                  <Text style={[
                    styles.dayText,
                    status && styles.dayTextWithStatus
                  ]}>
                    {day}
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      ))}

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: "#51CF66" }]} />
          <Text style={styles.legendText}>Completed</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: "#FF6B6B" }]} />
          <Text style={styles.legendText}>Incomplete</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: "#4DABF7" }]} />
          <Text style={styles.legendText}>Frozen</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
    textAlign: "center",
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 6,
  },
  dayHeader: {
    width: 38,
    alignItems: "center",
    paddingVertical: 4,
  },
  dayHeaderText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#999",
  },
  dayCell: {
    width: 38,
    height: 38,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  dayText: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  dayTextWithStatus: {
    color: "#fff",
    fontWeight: "600",
  },
  legend: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E5EA",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendColor: {
    width: 14,
    height: 14,
    borderRadius: 3,
    marginRight: 6,
  },
  legendText: {
    fontSize: 11,
    color: "#666",
  },
});

export default HabitCalendar;
