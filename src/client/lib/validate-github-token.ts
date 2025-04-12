export function validateGitHubToken(token: string): boolean {
  if (typeof token !== 'string') return false;

  // List of valid GitHub token prefixes (as of 2025)
  const validPrefixes = [
    'ghp_',         // Personal Access Token (classic)
    'github_pat_',  // Personal Access Token (fine-grained)
    'gho_',         // OAuth Access Token
    'ghu_',         // User-to-server token
    'ghv_',         // GitHub App token
    'gha_',         // Actions token
    'ghr_',         // Refresh token
  ];

  return validPrefixes.some(prefix => token.startsWith(prefix));
}