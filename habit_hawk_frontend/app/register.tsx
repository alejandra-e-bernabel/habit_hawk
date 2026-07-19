import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

import { AppText } from "@/components/AppText";
import { COLORS, FONTS } from "@/constants/theme";
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/services/api";
import ProfileIconSelector from "@/components/ProfileIconSelector";
import { getUserProfileIconByName } from "@/constants/UserProfileIcons";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [showIconSelector, setShowIconSelector] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { register, isLoading, clearError } = useAuth();

  const clearFormError = () => {
    if (formError) {
      setFormError(null);
    }
  };

  const handleRegister = async () => {
    const trimmedUsername = username.trim();

    setFormError(null);
    clearError();

    if (!trimmedUsername || !password || !confirmPassword) {
      setFormError("Please complete all fields.");
      return;
    }

    if (trimmedUsername.length < 3) {
      setFormError("Username must be at least 3 characters long.");
      return;
    }

    if (password.length < 6) {
      setFormError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setFormError("The passwords do not match.");
      return;
    }

    try {
      await register(trimmedUsername, password, firstName.trim() || undefined, lastName.trim() || undefined, selectedIcon || undefined);
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(error.detail);
      } else if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError(
          "Unable to create your account. Please try again."
        );
      }
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.header}>
            <SafeAreaView
              edges={["top"]}
              style={styles.headerSafeArea}
            >
              <View style={styles.logoCircle}>
                <AppText weight="bold" style={styles.logoText}>
                  Logo
                </AppText>
              </View>

              <AppText weight="semiBold" style={styles.appName}>
                Habit Hawk
              </AppText>
            </SafeAreaView>
          </View>

          <View style={styles.formContainer}>
            <AppText weight="bold" style={styles.formTitle}>
              Sign Up
            </AppText>

            <AppText style={styles.formSubtitle}>
              Create your account
            </AppText>

            <TextInput
              style={styles.input}
              placeholder="First Name (Optional)"
              placeholderTextColor={COLORS.placeholder}
              value={firstName}
              onChangeText={(value) => {
                setFirstName(value);
                clearFormError();
              }}
              autoCapitalize="words"
              autoCorrect={false}
              editable={!isLoading}
            />

            <TextInput
              style={styles.input}
              placeholder="Last Name (Optional)"
              placeholderTextColor={COLORS.placeholder}
              value={lastName}
              onChangeText={(value) => {
                setLastName(value);
                clearFormError();
              }}
              autoCapitalize="words"
              autoCorrect={false}
              editable={!isLoading}
            />

            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setShowIconSelector(true)}
              disabled={isLoading}
            >
              <View style={styles.iconButtonContent}>
                {selectedIcon ? (
                  <>
                    <View style={[styles.selectedIconPreview, { backgroundColor: getUserProfileIconByName(selectedIcon).backgroundColor }]}>
                      <Ionicons
                        name={getUserProfileIconByName(selectedIcon).ionicon as any}
                        size={20}
                        color={getUserProfileIconByName(selectedIcon).iconColor}
                      />
                    </View>
                    <AppText style={styles.iconButtonText}>
                      {getUserProfileIconByName(selectedIcon).label}
                    </AppText>
                  </>
                ) : (
                  <>
                    <Ionicons
                      name="person-circle-outline"
                      size={24}
                      color={COLORS.placeholder}
                    />
                    <AppText style={styles.iconButtonTextPlaceholder}>
                      Choose Profile Icon (Optional)
                    </AppText>
                  </>
                )}
              </View>
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor={COLORS.placeholder}
              value={username}
              onChangeText={(value) => {
                setUsername(value);
                clearFormError();
              }}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="username"
              editable={!isLoading}
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={COLORS.placeholder}
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                clearFormError();
              }}
              secureTextEntry
              autoComplete="new-password"
              editable={!isLoading}
            />

            <TextInput
              style={styles.input}
              placeholder="Repeat Password"
              placeholderTextColor={COLORS.placeholder}
              value={confirmPassword}
              onChangeText={(value) => {
                setConfirmPassword(value);
                clearFormError();
              }}
              secureTextEntry
              autoComplete="new-password"
              editable={!isLoading}
              returnKeyType="done"
              onSubmitEditing={handleRegister}
            />

            {formError ? (
              <AppText style={styles.errorText}>
                {formError}
              </AppText>
            ) : null}

            <TouchableOpacity
              style={[
                styles.primaryButton,
                isLoading && styles.primaryButtonDisabled,
              ]}
              onPress={handleRegister}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <AppText
                  weight="semiBold"
                  style={styles.primaryButtonText}
                >
                  Sign Up
                </AppText>
              )}
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />

              <AppText
                weight="semiBold"
                style={styles.dividerText}
              >
                Or
              </AppText>

              <View style={styles.dividerLine} />
            </View>

            <View style={styles.accountRow}>
              <AppText style={styles.accountText}>
                Already have an account?{" "}
              </AppText>

              <Link href="/login" asChild>
                <TouchableOpacity disabled={isLoading}>
                  <AppText
                    weight="semiBold"
                    style={styles.accountLink}
                  >
                    Login
                  </AppText>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={showIconSelector}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <AppText weight="semiBold" style={styles.modalTitle}>
              Choose Profile Icon
            </AppText>
            <TouchableOpacity
              onPress={() => setShowIconSelector(false)}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={28} color={COLORS.heading} />
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
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
    overflow: "hidden",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
    paddingBottom: 40,
  },
  header: {
    alignSelf: "center",
    alignItems: "center",
    width: "140%",
    height: 350,
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 280,
    borderBottomRightRadius: 280,
    overflow: "hidden",
  },
  headerSafeArea: {
    flex: 1,
    alignItems: "center",
    paddingTop: 18,
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.logoBackground,
  },
  logoText: {
    color: COLORS.heading,
    fontSize: 16,
  },
  appName: {
    marginTop: 20,
    color: COLORS.white,
    fontSize: 32,
  },
  formContainer: {
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    paddingTop: 28,
    paddingHorizontal: 24,
  },
  formTitle: {
    color: COLORS.heading,
    fontSize: 28,
  },
  formSubtitle: {
    marginTop: 4,
    marginBottom: 28,
    color: COLORS.heading,
    fontSize: 16,
  },
  input: {
    width: "100%",
    height: 51,
    marginBottom: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 8,
    backgroundColor: COLORS.inputBackground,
    color: COLORS.heading,
    fontFamily: FONTS.regular,
    fontSize: 14,
  },
  errorText: {
    marginTop: -8,
    marginBottom: 12,
    color: COLORS.error,
    fontSize: 14,
    textAlign: "center",
  },
  primaryButton: {
    width: "100%",
    height: 51,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 18,
  },
  dividerRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 26,
  },
  dividerLine: {
    flex: 1,
    height: 2,
    backgroundColor: COLORS.divider,
  },
  dividerText: {
    marginHorizontal: 14,
    color: COLORS.placeholder,
    fontSize: 18,
  },
  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  accountText: {
    color: COLORS.heading,
    fontSize: 18,
  },
  accountLink: {
    color: COLORS.primary,
    fontSize: 18,
  },
  iconButton: {
    width: "100%",
    height: 51,
    marginBottom: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 8,
    backgroundColor: COLORS.inputBackground,
    justifyContent: "center",
  },
  iconButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconButtonText: {
    color: COLORS.heading,
    fontSize: 14,
    fontFamily: FONTS.regular,
  },
  iconButtonTextPlaceholder: {
    color: COLORS.placeholder,
    fontSize: 14,
    fontFamily: FONTS.regular,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    color: COLORS.heading,
  },
  modalCloseButton: {
    padding: 4,
  },
  selectedIconPreview: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});