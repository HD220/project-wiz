// src_refactored/core/domain/user/value-objects/user-id.vo.spec.ts
import { describe, it, expect } from 'vitest';
import { UserId } from './user-id.vo';
import { randomUUID } from 'crypto';

describe('UserId', () => {
  it('should create a UserId from a valid UUID string', () => {
    const validUUID = randomUUID();
    const userId = UserId.fromString(validUUID);
    expect(userId).toBeInstanceOf(UserId);
    expect(userId.value()).toBe(validUUID);
  });

  it('should generate a valid UserId', () => {
    const userId = UserId.generate();
    expect(userId).toBeInstanceOf(UserId);
    // Basic check for UUID format (more thorough check is in Identity.vo itself)
    expect(userId.value()).toMatch(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/);
  });

  it('should throw an error if creating from an invalid UUID string', () => {
    const invalidUUID = 'not-a-uuid';
    expect(() => UserId.fromString(invalidUUID)).toThrow('Invalid UUID format');
  });

  it('should correctly compare two UserIds with the same value', () => {
    const uuid = randomUUID();
    const userId1 = UserId.fromString(uuid);
    const userId2 = UserId.fromString(uuid);
    expect(userId1.equals(userId2)).toBe(true);
  });

  it('should correctly compare two UserIds with different values', () => {
    const userId1 = UserId.generate();
    const userId2 = UserId.generate();
    expect(userId1.equals(userId2)).toBe(false);
  });

  it('should not be equal to null or undefined', () => {
    const userId = UserId.generate();
    expect(userId.equals(null as any)).toBe(false);
    expect(userId.equals(undefined as any)).toBe(false);
  });
});
