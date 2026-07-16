import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
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

import { AppText } from "@/components/AppText";
import { COLORS, FONTS } from "@/constants/theme";
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/services/api";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const { login, isLoading, clearError } = useAuth();

  const clearFormError = () => {
    if (formError) {
      setFormError(null);
    }
  };

  const handleLogin = async () => {
    const trimmedUsername = username.trim();

    setFormError(null);
    clearError();

    if (!trimmedUsername || !password) {
      setFormError("Please enter both username and password.");
      return;
    }

    try {
      await login(trimmedUsername, password);
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(error.detail);
      } else if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError(
          "Unable to log in. Please check your credentials."
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
              Sign In
            </AppText>

            <AppText style={styles.formSubtitle}>
              Enter your username and password to log in
            </AppText>

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
              autoComplete="current-password"
              editable={!isLoading}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />

            <TouchableOpacity
              style={styles.forgotPasswordButton}
              onPress={() => {
                setFormError(
                  "Password reset is not available yet."
                );
              }}
              disabled={isLoading}
            >
              <AppText
                weight="semiBold"
                style={styles.forgotPasswordText}
              >
                Forgot Password?
              </AppText>
            </TouchableOpacity>

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
              onPress={handleLogin}
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
                  Login
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
                Don&apos;t have an account?{" "}
              </AppText>

              <Link href="/register" asChild>
                <TouchableOpacity disabled={isLoading}>
                  <AppText
                    weight="semiBold"
                    style={styles.accountLink}
                  >
                    Sign Up
                  </AppText>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  forgotPasswordButton: {
    alignSelf: "flex-end",
    marginTop: -6,
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: COLORS.primary,
    fontSize: 14,
  },
  errorText: {
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
});