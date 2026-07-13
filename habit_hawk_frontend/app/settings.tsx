import React from "react";

import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from "react-native";
import { Stack, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/useAuth";

export default function Settings() {
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        "Are you sure you want to log out?"
      );

      if (confirmed) {
        await logout();
      }

      return;
    }

    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Log Out",
          style: "destructive",
          onPress: logout,
        },
      ]
    );
  };
  const settingsSections = [
    {
      title: "Account",
      items: [
        { icon: "person-outline", label: "Profile", action: () => {} },
        { icon: "lock-closed-outline", label: "Change Password", action: () => {} },
        { icon: "time-outline", label: "Timezone", action: () => {} },
      ],
    },
    {
      title: "Preferences",
      items: [
        { icon: "notifications-outline", label: "Notifications", action: () => {} },
        { icon: "moon-outline", label: "Dark Mode", action: () => {} },
        { icon: "language-outline", label: "Language", action: () => {} },
      ],
    },
    {
      title: "About",
      items: [
        { icon: "information-circle-outline", label: "About Habit Hawk", action: () => {} },
        { icon: "help-circle-outline", label: "Help & Support", action: () => {} },
        { icon: "document-text-outline", label: "Privacy Policy", action: () => {} },
      ],
    },
  ];

  return (
    <>
      <Stack.Screen
        options={{
          title: "Settings",
          presentation: "modal",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="close" size={28} color="#007AFF" />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          {settingsSections.map((section, index) => (
            <View key={index} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.sectionContent}>
                {section.items.map((item, itemIndex) => (
                  <TouchableOpacity
                    key={itemIndex}
                    style={[
                      styles.settingItem,
                      itemIndex === section.items.length - 1 && styles.lastItem,
                    ]}
                    onPress={item.action}
                  >
                    <View style={styles.settingLeft}>
                      <Ionicons name={item.icon as any} size={24} color="#666" />
                      <Text style={styles.settingLabel}>{item.label}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#999" />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>

          {user && (
            <Text style={styles.userInfo}>
              Logged in as: {user.username}
            </Text>
          )}

          <Text style={styles.version}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
    marginLeft: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    color: "#333",
    marginLeft: 12,
  },
  logoutButton: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF3B30",
    marginLeft: 8,
  },
  userInfo: {
    textAlign: "center",
    fontSize: 14,
    color: "#666",
    marginTop: 16,
  },
  version: {
    textAlign: "center",
    fontSize: 14,
    color: "#999",
    marginTop: 24,
  },
});
