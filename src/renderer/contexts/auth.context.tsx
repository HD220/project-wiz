import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type { User } from "@/shared/types/user";

export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  useEffect(() => {
    async function loadSession() {
      try {
        const response = await window.api.auth.getActiveSession({});

        if (response.success && response.data) {
          setUser(response.data.user);
        }
      } catch (_error) {
        // Session load failure is expected when user is not logged in
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
    if (response.success) {
      setUser(response.data.user);
    } else {
      throw new Error(response.error || "Login failed");
    }
  };

  const logout = async () => {
    try {
      await window.api.auth.logout({});
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
