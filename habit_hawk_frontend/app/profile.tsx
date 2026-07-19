import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/useAuth";
import { Colors } from "@/constants/Colors";
import AvatarIcon from "@/components/AvatarIcon";
import ProfileIconSelector from "@/components/ProfileIconSelector";
import { getUserProfileIconByName } from "@/constants/UserProfileIcons";

export default function Profile() {
  const router = useRouter();
  const { user, updateProfile, isLoading } = useAuth();

  const [firstName, setFirstName] = useState(user?.first_name || "");
  const [lastName, setLastName] = useState(user?.last_name || "");
  const [selectedIcon, setSelectedIcon] = useState<string | null>(
    user?.profile_icon_name || null
  );
  const [showIconSelector, setShowIconSelector] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const hasChanges =
    firstName !== (user?.first_name || "") ||
    lastName !== (user?.last_name || "") ||
    selectedIcon !== (user?.profile_icon_name || null);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      console.log('[Profile] Saving with:', {
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        selectedIcon: selectedIcon || undefined,
      });

      await updateProfile(
        firstName.trim() || undefined,
        lastName.trim() || undefined,
        selectedIcon || undefined
      );

      console.log('[Profile] Save successful!');
      Alert.alert("Success", "Profile updated successfully!");
      router.back();
    } catch (error) {
      console.error('[Profile] Save error:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to update profile. Please try again.";
      Alert.alert("Error", errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      Alert.alert(
        "Discard Changes?",
        "You have unsaved changes. Are you sure you want to go back?",
        [
          { text: "Keep Editing", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      router.back();
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
          <Ionicons name="close" size={28} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity
          onPress={handleSave}
          style={styles.headerButton}
          disabled={!hasChanges || isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <Text
              style={[
                styles.saveText,
                (!hasChanges || isSaving) && styles.saveTextDisabled,
              ]}
            >
              Save
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <AvatarIcon
            firstName={firstName}
            lastName={lastName}
            username={user.username}
            profileIconName={selectedIcon || undefined}
            size="xlarge"
            borderColor={Colors.primary}
            borderWidth={4}
          />
          <TouchableOpacity
            style={styles.changeAvatarButton}
            onPress={() => setShowIconSelector(true)}
          >
            <Ionicons name="camera-outline" size={20} color={Colors.primary} />
            <Text style={styles.changeAvatarText}>Change Icon</Text>
          </TouchableOpacity>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          {/* Username (read-only) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <View style={[styles.input, styles.inputReadOnly]}>
              <Text style={styles.readOnlyText}>@{user.username}</Text>
            </View>
            <Text style={styles.helperText}>Username cannot be changed</Text>
          </View>

          {/* First Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your first name"
              placeholderTextColor={Colors.textMuted}
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          {/* Last Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your last name"
              placeholderTextColor={Colors.textMuted}
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          {/* Current Icon Preview */}
          {selectedIcon && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Current Profile Icon</Text>
              <View style={styles.iconPreviewContainer}>
                <View
                  style={[
                    styles.iconPreview,
                    {
                      backgroundColor: getUserProfileIconByName(selectedIcon)
                        .backgroundColor,
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      getUserProfileIconByName(selectedIcon).ionicon as any
                    }
                    size={32}
                    color={getUserProfileIconByName(selectedIcon).iconColor}
                  />
                </View>
                <Text style={styles.iconLabel}>
                  {getUserProfileIconByName(selectedIcon).label}
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Icon Selector Modal */}
      <Modal
        visible={showIconSelector}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Choose Profile Icon</Text>
            <TouchableOpacity
              onPress={() => setShowIconSelector(false)}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={28} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
          <ProfileIconSelector
            selectedIcon={selectedIcon}
            onSelectIcon={(iconName) => {
              setSelectedIcon(iconName);
              setShowIconSelector(false);
            }}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerButton: {
    padding: 8,
    minWidth: 60,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  saveText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary,
  },
  saveTextDisabled: {
    color: Colors.textMuted,
  },
  scrollView: {
    flex: 1,
  },
  avatarSection: {
    alignItems: "center",
    paddingVertical: 32,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  changeAvatarButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: Colors.primaryTint,
  },
  changeAvatarText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary,
  },
  formSection: {
    padding: 16,
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  input: {
    height: 48,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    backgroundColor: Colors.white,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  inputReadOnly: {
    backgroundColor: Colors.backgroundSecondary,
  },
  readOnlyText: {
    fontSize: 16,
    color: Colors.textMuted,
    lineHeight: 48,
  },
  helperText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  iconPreviewContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 16,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
  },
  iconPreview: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  iconLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.textPrimary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  modalCloseButton: {
    padding: 4,
  },
});
