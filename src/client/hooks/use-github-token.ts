declare global {
  interface Window {
    githubTokenAPI: {
      saveGitHubToken(token: string): Promise<void>;
      removeGitHubToken(): Promise<void>;
      getGitHubTokenStatus(): Promise<boolean>;
    };
  }
}

import { useCallback } from 'react';

export function useGitHubToken() {
  const getGitHubTokenStatus = useCallback(async (): Promise<boolean> => {
    if (!window.githubTokenAPI) throw new Error('GitHubTokenAPI not available');
    return window.githubTokenAPI.getGitHubTokenStatus();
  }, []);

  const saveGitHubToken = useCallback(async (token: string): Promise<void> => {
    if (!window.githubTokenAPI) throw new Error('GitHubTokenAPI not available');
    return window.githubTokenAPI.saveGitHubToken(token);
  }, []);

  const removeGitHubToken = useCallback(async (): Promise<void> => {
    if (!window.githubTokenAPI) throw new Error('GitHubTokenAPI not available');
    return window.githubTokenAPI.removeGitHubToken();
  }, []);

  return {
    getGitHubTokenStatus,
    saveGitHubToken,
    removeGitHubToken,
  };
}