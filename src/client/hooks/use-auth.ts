import { useState, useEffect, useCallback } from "react";
import {
  saveTokens,
  clearTokens,
  getAccessToken,
  getRefreshToken,
  getUser,
  AuthUser,
  AuthSession,
} from "./auth-storage";
import {
  register as apiRegister,
  login as apiLogin,
  logout as apiLogout,
  refresh as apiRefresh,
  verifySession,
} from "./auth-api";

type AuthError = string | null;

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(getUser());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError>(null);

  // On mount, verify session if token exists
  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }
    verifySession(token)
      .then((data) => {
        setUser(data);
      })
      .catch(() => {
        clearTokens();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // Register
  const register = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      const data = await apiRegister(email, password);
      return data;
    } catch (err: any) {
      setError(err.message || "Registration failed");
      throw err;
    }
  }, []);

  // Login
  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      const session = await apiLogin(email, password);
      saveTokens(session);
      setUser(session.user);
      return session;
    } catch (err: any) {
      setError(err.message || "Login failed");
      throw err;
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    const token = getAccessToken();
    await apiLogout(token);
    clearTokens();
    setUser(null);
  }, []);

  // Refresh token
  const refresh = useCallback(async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) throw new Error("No refresh token");
    try {
      const session = await apiRefresh(refreshToken);
      saveTokens(session);
      setUser(session.user);
      return session;
    } catch (err: any) {
      clearTokens();
      setUser(null);
      throw err;
    }
  }, []);

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