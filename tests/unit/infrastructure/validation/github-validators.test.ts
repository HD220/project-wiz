import { describe, it, expect } from 'vitest';
import { GitHubOAuthCallbackValidator, GitHubOAuthTokenValidator } from '../../../../src/core/infrastructure/validation/github-validators';

describe('GitHub Validators', () => {
  describe('GitHubOAuthCallbackValidator', () => {
    it('should validate valid callback params', () => {
      const params = {
        code: 'valid_code_123',
        state: 'state_value'
      };
      expect(() => GitHubOAuthCallbackValidator.validate(params)).not.toThrow();
    });

    it('should reject invalid callback params', () => {
      const params = {
        code: '',
        state: 'state_value'
      };
      expect(() => GitHubOAuthCallbackValidator.validate(params)).toThrow();
    });
  });

  describe('GitHubOAuthTokenValidator', () => {
    it('should validate valid token response', () => {
      const response = {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        token_type: 'bearer',
        scope: 'repo,user'
      };
      expect(() => GitHubOAuthTokenValidator.validate(response)).not.toThrow();
    });

    it('should reject invalid token response', () => {
      const response = {
        access_token: '',
        token_type: 'bearer',
        scope: 'repo,user'
      };
      expect(() => GitHubOAuthTokenValidator.validate(response)).toThrow();
    });

    it('should reject token with invalid format', () => {
      const response = {
        access_token: 'invalid_token_format',
        token_type: 'bearer',
        scope: 'repo,user'
      };
      expect(() => GitHubOAuthTokenValidator.validate(response)).toThrow();
    });

    it('should reject token that is too short', () => {
      const response = {
        access_token: 'short',
        token_type: 'bearer',
        scope: 'repo,user'
      };
      expect(() => GitHubOAuthTokenValidator.validate(response)).toThrow();
    });

    it('should reject token that is too long', () => {
      const response = {
        access_token: 'a'.repeat(2001),
        token_type: 'bearer',
        scope: 'repo,user'
      };
      expect(() => GitHubOAuthTokenValidator.validate(response)).toThrow();
    });

    it('should reject scope that is too short', () => {
      const response = {
        access_token: 'valid_token_123',
        token_type: 'bearer',
        scope: 'a'
      };
      expect(() => GitHubOAuthTokenValidator.validate(response)).toThrow();
    });

    it('should reject additional properties', () => {
      const response = {
        access_token: 'valid_token_123',
        token_type: 'bearer',
        scope: 'repo,user',
        extra: 'property'
      };
      expect(() => GitHubOAuthTokenValidator.validate(response)).toThrow();
    });
  });
});