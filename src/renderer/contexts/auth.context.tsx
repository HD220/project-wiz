import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type {
  AuthenticatedUser,
  AuthResult,
} from "@/main/features/auth/auth.types";

interface AuthContext {
  isAuthenticated: boolean;
  user: AuthenticatedUser | null;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContext | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  useEffect(() => {
    async function loadSession() {
      if (!window.api?.auth) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await window.api.auth.getActiveSession();

        if (response.success && response.data?.user) {
          setUser(response.data.user);
        }
      } catch (error) {
        console.warn("Failed to load active session:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadSession();
  }, []);

  const login = async (credentials: { username: string; password: string }) => {
    if (!window.api?.auth) {
      throw new Error("Authentication API not available");
    }

    const response = await window.api.auth.login(credentials);
    if (response.success && response.data) {
      const authResult = response.data as AuthResult;
      setUser(authResult.user);
    } else {
      throw new Error(response.error || "Login failed");
    }
  };

  const logout = async () => {
    try {
      if (window.api?.auth) {
        await window.api.auth.logout();
      }
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, login, logout, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export { AuthProvider, useAuth };
export type { AuthContext };
