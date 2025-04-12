import { useCallback } from 'react';

export interface IGitHubTokenAPI {
  saveGitHubToken(token: string): Promise<void>;
  removeGitHubToken(): Promise<void>;
  getGitHubTokenStatus(): Promise<boolean>;
}

// Declaração global para o TypeScript reconhecer window.githubTokenAPI
declare global {
  interface Window {
    githubTokenAPI?: IGitHubTokenAPI;
  }
}

function getDefaultGitHubTokenAPI(): IGitHubTokenAPI {
  if (
    typeof window !== 'undefined' &&
    window.githubTokenAPI &&
    typeof window.githubTokenAPI.saveGitHubToken === 'function' &&
    typeof window.githubTokenAPI.removeGitHubToken === 'function' &&
    typeof window.githubTokenAPI.getGitHubTokenStatus === 'function'
  ) {
    return window.githubTokenAPI;
  }
  throw new Error('GitHubTokenAPI not available');
}

export function useGitHubToken(api?: IGitHubTokenAPI) {
  const githubTokenAPI = api ?? getDefaultGitHubTokenAPI();

  const getGitHubTokenStatus = useCallback(async (): Promise<boolean> => {
    try {
      return await githubTokenAPI.getGitHubTokenStatus();
    } catch (error) {
      throw new Error('Failed to get GitHub token status');
    }
  }, [githubTokenAPI]);

  const saveGitHubToken = useCallback(async (token: string): Promise<void> => {
    if (!token || typeof token !== 'string') {
      throw new Error('Invalid token');
    }
    try {
      await githubTokenAPI.saveGitHubToken(token);
    } catch (error) {
      throw new Error('Failed to save GitHub token');
    }
  }, [githubTokenAPI]);

  const removeGitHubToken = useCallback(async (): Promise<void> => {
    try {
      await githubTokenAPI.removeGitHubToken();
    } catch (error) {
      throw new Error('Failed to remove GitHub token');
    }
  }, [githubTokenAPI]);

  return {
    getGitHubTokenStatus,
    saveGitHubToken,
    removeGitHubToken,
  };
}