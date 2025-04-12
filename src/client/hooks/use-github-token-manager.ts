import { useCallback, useEffect, useState } from 'react';
import { IGitHubTokenManagerService } from '../services/github-token-manager-service';

export interface UseGitHubTokenManagerResult {
  token: string;
  isTokenSaved: boolean;
  loading: boolean;
  error: string | null;
  onTokenChange: (value: string) => void;
  onSave: () => Promise<void>;
  onRemove: () => Promise<void>;
  resetError: () => void;
}

export function useGitHubTokenManager(
  service: IGitHubTokenManagerService
): UseGitHubTokenManagerResult {
  const [token, setToken] = useState('');
  const [isTokenSaved, setIsTokenSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGitHubTokenStatus = useCallback(async () => {
    try {
      const status = await service.getTokenStatus();
      setIsTokenSaved(status);
    } catch (err) {
      setError('status');
    }
  }, [service]);

  useEffect(() => {
    fetchGitHubTokenStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onTokenChange = useCallback((value: string) => {
    setToken(value);
  }, []);

  const onSave = useCallback(async () => {
    if (!service.validateToken(token)) {
      setError('invalid');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await service.saveToken(token);
      setToken('');
      await fetchGitHubTokenStatus();
    } catch (err) {
      setError('save');
    } finally {
      setLoading(false);
    }
  }, [token, service, fetchGitHubTokenStatus]);

  const onRemove = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await service.removeToken();
      await fetchGitHubTokenStatus();
    } catch (err) {
      setError('remove');
    } finally {
      setLoading(false);
    }
  }, [service, fetchGitHubTokenStatus]);

  const resetError = useCallback(() => setError(null), []);

  return {
    token,
    isTokenSaved,
    loading,
    error,
    onTokenChange,
    onSave,
    onRemove,
    resetError,
  };
}