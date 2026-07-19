import React, { useState } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useFocusEffect, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import TodayGoals from "@/componnets/home/TodayGoals";
import LeaderboardPreview from "@/componnets/home/LeaderboardPreview";
import MyGoalsPreview from "@/componnets/home/MyGoalsPreview";
import StreakFreezePreview from "@/componnets/home/StreakFreezePreview";

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      setRefreshKey((current) => current + 1);
    }, [])
  );

  return (
    <View style={styles.container}>
      <ScrollView
        key={refreshKey}
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <TodayGoals />
        <StreakFreezePreview />
        <LeaderboardPreview />
        <MyGoalsPreview />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/add-habit")}
        activeOpacity={0.8}
      >
        <Ionicons name="add-outline" size={28} color={Colors.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 100, // Extra space for FAB
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
