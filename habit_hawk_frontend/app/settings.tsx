import React from "react";

import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from "react-native";
import { Stack, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/hooks/useAuth";
import AvatarIcon from "@/components/AvatarIcon";

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
        { icon: "person-outline", label: "Edit Profile", action: () => router.push("/profile") },
        { icon: "lock-closed-outline", label: "Change Password", action: () => {} },
        { icon: "time-outline", label: "Timezone", action: () => {} },
      ],
    },
    {
      title: "Social",
      items: [
        { icon: "people-outline", label: "Friends", action: () => router.push("/friends") },
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
              <Ionicons name="close-outline" size={28} color="Colors.primary" />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          {/* User Profile Preview */}
          {user && (
            <View style={styles.profileSection}>
              <AvatarIcon
                firstName={user.first_name}
                lastName={user.last_name}
                username={user.username}
                profileIconName={user.profile_icon_name}
                profileImageUrl={user.profile_image_url}
                size="large"
                borderColor={Colors.primary}
                borderWidth={3}
              />
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>
                  {user.first_name || user.last_name
                    ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
                    : user.username}
                </Text>
                <Text style={styles.profileUsername}>@{user.username}</Text>
              </View>
              <TouchableOpacity
                style={styles.editProfileButton}
                onPress={() => router.push("/profile")}
              >
                <Ionicons name="create-outline" size={20} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          )}

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
                    <Ionicons name="chevron-forward-outline" size={20} color="#999" />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>

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
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  profileUsername: {
    fontSize: 14,
    color: "#666",
  },
  editProfileButton: {
    padding: 8,
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
  version: {
    textAlign: "center",
    fontSize: 14,
    color: "#999",
    marginTop: 24,
  },
});
