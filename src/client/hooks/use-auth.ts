import { useState, useCallback } from "react";
import { AuthUser, AuthSession } from "../types/auth";
import { useVerifySessionOnMount } from "./use-verify-session-on-mount";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshSession,
} from "./auth-actions";
import { getAccessToken } from "./auth-storage";

type AuthError = string | null;

/**
 * Orchestrates global authentication state and delegates logic to specialized hooks/utilities.
 */
export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError>(null);

  // Verify session on mount
  useVerifySessionOnMount(setUser, setLoading);

  // Register
  const register = useCallback(
    (email: string, password: string) =>
      registerUser(email, password, setError),
    []
  );

  // Login
  const login = useCallback(
    (email: string, password: string) =>
      loginUser(email, password, setUser, setError),
    []
  );

  // Logout
  const logout = useCallback(() => logoutUser(setUser), []);

  // Refresh token
  const refresh = useCallback(() => refreshSession(setUser), []);

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    refresh,
    getAccessToken,
  };
}