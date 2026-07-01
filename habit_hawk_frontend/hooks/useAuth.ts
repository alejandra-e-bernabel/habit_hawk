/**
 * useAuth Hook
 * Provides easy access to authentication context throughout the app
 */

import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";

/**
 * Custom hook to access authentication context
 *
 * @throws Error if used outside of AuthProvider
 * @returns Authentication context with user state and auth methods
 *
 * @example
 * const { user, login, logout, isLoading, isAuthenticated } = useAuth();
 *
 * await login('username', 'password');
 * console.log(user?.username);
 * await logout();
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
