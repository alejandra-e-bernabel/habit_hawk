/**
 * Authentication Context Provider
 * Manages global authentication state and provides auth methods to the app
 */

import React, { createContext, useState, useEffect, ReactNode } from "react";
import { router } from "expo-router";
import * as AuthServices from "@/services/AuthServices";
import type { UserResponse } from "@/types/auth";
import { ApiError } from "@/services/api";

interface AuthContextType {
  user: UserResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = user !== null;

  /**
   * Initialize auth state on app start
   * Checks for stored token and validates it
   */
  useEffect(() => {
    loadUser();
  }, []);

  /**
   * Load user from stored token
   */
  const loadUser = async () => {
    try {
      setIsLoading(true);
      const hasToken = await AuthServices.isAuthenticated();

      if (hasToken) {
        // Validate token and fetch user data
        const isValid = await AuthServices.validateToken();
        if (isValid) {
          const userData = await AuthServices.getCurrentUser();
          setUser(userData);
        }
      }
    } catch (err) {
      console.error("Failed to load user:", err);
      // Token is invalid, clear it
      await AuthServices.logout();
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Login with username and password
   */
  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Call login service
      await AuthServices.login(username, password);

      // Fetch user data
      const userData = await AuthServices.getCurrentUser();
      setUser(userData);

      // Navigate to main app
      router.replace("/(tabs)");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.detail);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
      throw err; // Re-throw so calling component can handle it
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout and clear user data
   */
  const logout = async () => {
    try {
      setIsLoading(true);
      await AuthServices.logout();
      setUser(null);
      setError(null);
      router.replace("/login");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Clear error message
   */
  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        error,
        login,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
