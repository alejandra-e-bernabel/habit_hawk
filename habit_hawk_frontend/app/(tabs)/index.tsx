import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useFocusEffect } from "expo-router";
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
  },
});
