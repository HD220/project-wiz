import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useState, type ReactNode } from "react";

import type {
  AuthenticatedUser,
  AuthResult,
} from "@/main/features/auth/auth.types";

interface AuthContextValue {
  user: AuthenticatedUser | null;
  sessionToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Use TanStack Query for session loading instead of useEffect
  const { isLoading } = useQuery({
    queryKey: ["auth", "activeSession"],
    queryFn: async () => {
      const response = await window.api.auth.getActiveSession();
      if (response.success && response.data) {
        const authResult = response.data as AuthResult;
        setUser(authResult.user);
        setSessionToken(authResult.sessionToken);
        return authResult;
      }
      return null;
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  const clearAuthState = () => {
    setUser(null);
    setSessionToken(null);
    setError(null);
    // Invalidate auth queries when clearing state
    queryClient.invalidateQueries({ queryKey: ["auth"] });
  };

  const clearError = () => {
    setError(null);
  };

  const login = async (credentials: { username: string; password: string }) => {
    setError(null);

    try {
      const response = await window.api.auth.login(credentials);

      if (response.success && response.data) {
        const authResult = response.data as AuthResult;
        setUser(authResult.user);
        setSessionToken(authResult.sessionToken);

        // Invalidate and refetch auth queries after successful login
        await queryClient.invalidateQueries({ queryKey: ["auth"] });
      } else {
        const errorMessage = response.error || "Login failed";
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Login failed";
      setError(errorMessage);
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (sessionToken) {
        await window.api.auth.logout(sessionToken);
      }
    } finally {
      clearAuthState();
    }
  };

  const value: AuthContextValue = {
    user,
    sessionToken,
    isAuthenticated: !!user && !!sessionToken,
    isLoading,
    error,
    login,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export { AuthProvider, useAuth };
export type { AuthContextValue };
