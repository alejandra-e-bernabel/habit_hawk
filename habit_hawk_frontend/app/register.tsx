import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Link } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/services/api";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const { register, isLoading, clearError } = useAuth();

  const handleRegister = async () => {
    const trimmedUsername = username.trim();

    // Remove any previous message before validating again.
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
      await register(trimmedUsername, password);
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

  const clearFormError = () => {
    if (formError) {
      setFormError(null);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Habit Hawk</Text>
      <Text style={styles.subtitle}>Create Account</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={(value) => {
          setUsername(value);
          clearFormError();
        }}
        autoCapitalize="none"
        autoCorrect={false}
        editable={!isLoading}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={(value) => {
          setPassword(value);
          clearFormError();
        }}
        secureTextEntry
        editable={!isLoading}
      />

      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={(value) => {
          setConfirmPassword(value);
          clearFormError();
        }}
        secureTextEntry
        editable={!isLoading}
      />

      {formError ? (
        <Text style={styles.errorText}>{formError}</Text>
      ) : null}

      <TouchableOpacity
        style={[
          styles.button,
          isLoading && styles.buttonDisabled,
        ]}
        onPress={handleRegister}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Register</Text>
        )}
      </TouchableOpacity>

      <Link href="/login" asChild>
        <TouchableOpacity
          style={styles.linkButton}
          disabled={isLoading}
        >
          <Text style={styles.linkText}>
            Already have an account? Login
          </Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  subtitle: {
    fontSize: 24,
    marginBottom: 32,
    color: "#666",
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  errorText: {
    width: "100%",
    color: "#B00020",
    fontSize: 14,
    marginBottom: 8,
    textAlign: "center",
  },
  button: {
    width: "100%",
    height: 50,
    backgroundColor: "#007AFF",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  linkButton: {
    marginTop: 16,
  },
  linkText: {
    color: "#007AFF",
    fontSize: 14,
  },
});