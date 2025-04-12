export function validateGitHubToken(token: string): boolean {
  return typeof token === 'string' && token.startsWith('ghp_');
}