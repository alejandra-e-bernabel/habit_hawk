/**
 * Authentication service for handling login, token management, and user info
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiFetch, ApiError } from "./api";
import type { LoginRequest, TokenResponse, UserResponse } from "@/types/auth";

const TOKEN_KEY = "@habit_hawk_token";

/**
 * Login with username and password
 * Returns access token on success
 */
export async function login(
  username: string,
  password: string
): Promise<TokenResponse> {
  const credentials: LoginRequest = { username, password };

  const response = await apiFetch<TokenResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });

  // Store token in AsyncStorage for persistence
  await AsyncStorage.setItem(TOKEN_KEY, response.access_token);

  return response;
}

/**
 * Get current user information using stored token
 * Requires valid JWT token
 */
export async function getCurrentUser(): Promise<UserResponse> {
  const token = await getStoredToken();

  if (!token) {
    throw new ApiError(401, "No authentication token found");
  }

  const response = await apiFetch<UserResponse>("/auth/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response;
}

/**
 * Logout user by clearing stored token
 */
export async function logout(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

/**
 * Get stored authentication token
 * Returns null if no token is stored
 */
export async function getStoredToken(): Promise<string | null> {
  return await AsyncStorage.getItem(TOKEN_KEY);
}

/**
 * Check if user is authenticated (has a stored token)
 * Note: This doesn't validate if the token is still valid
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = await getStoredToken();
  return token !== null;
}

/**
 * Validate token by attempting to fetch current user
 * Returns true if token is valid, false otherwise
 */
export async function validateToken(): Promise<boolean> {
  try {
    await getCurrentUser();
    return true;
  } catch {
    // Token is invalid or expired, clear it
    await logout();
    return false;
  }
}
