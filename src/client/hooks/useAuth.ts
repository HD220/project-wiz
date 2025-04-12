// useAuth hook: JWT-based authentication for REST API

import { useState, useEffect, useCallback } from "react";

const API_URL = "http://localhost:3333";

interface AuthUser {
  id: string;
  email: string;
}

interface AuthSession {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

type AuthError = string | null;

function saveTokens(session: AuthSession) {
  localStorage.setItem("accessToken", session.accessToken);
  localStorage.setItem("refreshToken", session.refreshToken);
  localStorage.setItem("user", JSON.stringify(session.user));
}

function clearTokens() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
}

function getAccessToken() {
  return localStorage.getItem("accessToken");
}

function getRefreshToken() {
  return localStorage.getItem("refreshToken");
}

function getUser(): AuthUser | null {
  const raw = localStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

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
    fetch(`${API_URL}/auth/session`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Session invalid");
        const data = await res.json();
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
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Registration failed");
      throw new Error(data.error || "Registration failed");
    }
    return res.json();
  }, []);

  // Login
  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Login failed");
      throw new Error(data.error || "Login failed");
    }
    const session: AuthSession = await res.json();
    saveTokens(session);
    setUser(session.user);
    return session;
  }, []);

  // Logout
  const logout = useCallback(async () => {
    const token = getAccessToken();
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    clearTokens();
    setUser(null);
  }, []);

  // Refresh token
  const refresh = useCallback(async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) throw new Error("No refresh token");
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) {
      clearTokens();
      setUser(null);
      throw new Error("Refresh failed");
    }
    const session: AuthSession = await res.json();
    saveTokens(session);
    setUser(session.user);
    return session;
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