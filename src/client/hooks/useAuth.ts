import { useState, useEffect, useCallback } from "react";
import { AuthRepositoryKeytar, ManualTokenStrategy } from "../../core/services/auth";
import { GitHubOAuthService } from "../../core/infrastructure/electron/github/GitHubOAuthService";
import type { AuthToken } from "../../core/services/auth/types";

const repository = new AuthRepositoryKeytar();
const manualStrategy = new ManualTokenStrategy(repository);
const oauthService = new GitHubOAuthService();

export function useAuth() {
  const [token, setToken] = useState<AuthToken | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    repository.loadToken().then((saved) => {
      setToken(saved);
      setLoading(false);
    });
  }, []);

  const loginWithToken = useCallback(async (rawToken: string) => {
    const authToken = await manualStrategy.loginWithToken(rawToken);
    setToken(authToken);
  }, []);

  const loginWithOAuth = useCallback(async () => {
    const authToken = await oauthService.startOAuthFlow();
    await repository.saveToken(authToken);
    setToken(authToken);
  }, []);

  const logout = useCallback(async () => {
    await repository.removeToken();
    setToken(null);
  }, []);

  return {
    token,
    loading,
    loginWithToken,
    loginWithOAuth,
    logout,
    isAuthenticated: !!token,
  };
}