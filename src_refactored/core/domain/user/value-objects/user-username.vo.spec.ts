// src_refactored/core/domain/user/value-objects/user-username.vo.spec.ts
import { describe, it, expect } from 'vitest';
import { UserUsername } from './user-username.vo';
import { ValueError } from '../../../../common/errors';

describe('UserUsername', () => {
  it('should create a UserUsername with a valid username and convert to lowercase', () => {
    const username = 'John_Doe123';
    const userUsername = UserUsername.create(username);
    expect(userUsername).toBeInstanceOf(UserUsername);
    expect(userUsername.value()).toBe('john_doe123');
  });

  it('should trim whitespace and convert to lowercase', () => {
    const username = '  JohnDoe_123  ';
    const userUsername = UserUsername.create(username);
    expect(userUsername.value()).toBe('johndoe_123');
  });

  it('should throw ValueError if username is empty', () => {
    expect(() => UserUsername.create('')).toThrow(ValueError);
    expect(() => UserUsername.create('   ')).toThrow(ValueError);
  });

  it('should throw ValueError if username is too short', () => {
    expect(() => UserUsername.create('a')).toThrow(ValueError);
    expect(() => UserUsername.create('ab')).toThrow(ValueError);
    expect(() => UserUsername.create(' ab ')).toThrow(ValueError); // After trim
  });

  it('should throw ValueError if username is too long', () => {
    const longUsername = 'a'.repeat(31);
    expect(() => UserUsername.create(longUsername)).toThrow(ValueError);
  });

  it('should allow usernames at min and max length boundaries', () => {
    const minUsername = 'abc';
    expect(() => UserUsername.create(minUsername)).not.toThrow();
    const maxUsername = 'a'.repeat(30);
    expect(() => UserUsername.create(maxUsername)).not.toThrow();
  });

  it('should throw ValueError for usernames with invalid characters', () => {
    expect(() => UserUsername.create('User Name')).toThrow(ValueError); // Space
    expect(() => UserUsername.create('user.name')).toThrow(ValueError); // Dot
    expect(() => UserUsername.create('user@name')).toThrow(ValueError); // @ symbol
    expect(() => UserUsername.create('!username')).toThrow(ValueError); // Starts with !
    expect(() => UserUsername.create('username!')).toThrow(ValueError); // Ends with !
    expect(() => UserUsername.create('-username')).toThrow(ValueError); // Starts with -
    expect(() => UserUsername.create('username-')).toThrow(ValueError); // Ends with -
    expect(() => UserUsername.create('_username')).toThrow(ValueError); // Starts with _
    expect(() => UserUsername.create('username_')).toThrow(ValueError); // Ends with _
  });

  it('should allow usernames with hyphens and underscores in the middle', () => {
    expect(() => UserUsername.create('user-name')).not.toThrow();
    expect(() => UserUsername.create('user_name')).not.toThrow();
    expect(() => UserUsername.create('user-name_123')).not.toThrow();
  });

  it('should correctly compare two UserUsernames with the same value (case-insensitive)', () => {
    const username1 = 'TestUser';
    const username2 = 'testuser';
    const userUsername1 = UserUsername.create(username1);
    const userUsername2 = UserUsername.create(username2);
    expect(userUsername1.equals(userUsername2)).toBe(true);
  });

  it('should correctly compare two UserUsernames with different values', () => {
    const userUsername1 = UserUsername.create('Username1');
    const userUsername2 = UserUsername.create('Username2');
    expect(userUsername1.equals(userUsername2)).toBe(false);
  });
});
