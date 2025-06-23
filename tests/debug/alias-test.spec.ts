import { describe, it, expect } from 'vitest';
import { ok, isError } from '@/refactored/shared/result'; // Using the new alias convention

describe('Debug Alias Test Suite', () => {
  it('should import from aliased path @/refactored/shared/result', () => {
    expect(typeof ok).toBe('function');
    expect(typeof isError).toBe('function');
  });

  it('should use imported functions correctly', () => {
    const successResult = ok('test success');
    const errorResult = { success: false, error: new Error('test error') }; // Simplified error for this test

    expect(successResult.success).toBe(true);
    expect(successResult.value).toBe('test success');
    expect(isError(errorResult)).toBe(true);
  });
});
