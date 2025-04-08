import { useState, useEffect } from "react";
import { AuthService } from "../../core/services/auth";

interface UseAuthReturn {
  isAuthenticated: boolean;
  user: any | null;
  login: (credentials: any) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  isLoading: boolean;
}

const authService = new AuthService();

export const useAuth = (): UseAuthReturn => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const session = await authService.verificarSessao(token);
          if (session.success) {
            setIsAuthenticated(true);
            // TODO: buscar informações do usuário
            setUser({ name: "Usuário Autenticado" });
          } else {
            setIsAuthenticated(false);
            setUser(null);
          }
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (e: any) {
        setError(e.message || "Erro ao verificar autenticação");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.login(credentials);
      if (response.success) {
        localStorage.setItem("token", response.token);
        setIsAuthenticated(true);
        // TODO: buscar informações do usuário
        setUser({ name: "Usuário Autenticado" });
      } else {
        setError(response.message || "Credenciais inválidas");
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (e: any) {
      setError(e.message || "Erro ao fazer login");
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.logout();
      localStorage.removeItem("token");
      setIsAuthenticated(false);
      setUser(null);
    } catch (e: any) {
      setError(e.message || "Erro ao fazer logout");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isAuthenticated,
    user,
    login,
    logout,
    error,
    isLoading,
  };
};
