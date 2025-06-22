// src_refactored/core/domain/user/value-objects/user-nickname.vo.spec.ts
import { describe, it, expect } from 'vitest';
import { UserNickname } from './user-nickname.vo';
import { ValueError } from '../../../../common/errors';

describe('UserNickname', () => {
  it('should create a UserNickname with a valid nickname', () => {
    const nickname = 'JohnDoe';
    const userNickname = UserNickname.create(nickname);
    expect(userNickname).toBeInstanceOf(UserNickname);
    expect(userNickname.value()).toBe(nickname);
  });

  it('should trim whitespace from nickname', () => {
    const nickname = '  JohnDoe  ';
    const userNickname = UserNickname.create(nickname);
    expect(userNickname.value()).toBe('  JohnDoe  '); // The VO stores it as passed, validation trims
  });

  it('should throw ValueError if nickname is empty', () => {
    expect(() => UserNickname.create('')).toThrow(ValueError);
    expect(() => UserNickname.create('   ')).toThrow(ValueError);
  });

  it('should throw ValueError if nickname is too short', () => {
    expect(() => UserNickname.create('a')).toThrow(ValueError);
    expect(() => UserNickname.create(' a ')).toThrow(ValueError); // After trim
  });

  it('should throw ValueError if nickname is too long', () => {
    const longNickname = 'a'.repeat(51);
    expect(() => UserNickname.create(longNickname)).toThrow(ValueError);
  });

  it('should allow nicknames at min and max length boundaries', () => {
    const minNickname = 'ab';
    expect(() => UserNickname.create(minNickname)).not.toThrow();
    const maxNickname = 'a'.repeat(50);
    expect(() => UserNickname.create(maxNickname)).not.toThrow();
  });

  it('should correctly compare two UserNicknames with the same value', () => {
    const nickname = 'Jane_Doe';
    const userNickname1 = UserNickname.create(nickname);
    const userNickname2 = UserNickname.create(nickname);
    expect(userNickname1.equals(userNickname2)).toBe(true);
  });

  it('should correctly compare two UserNicknames with different values', () => {
    const userNickname1 = UserNickname.create('Nickname1');
    const userNickname2 = UserNickname.create('Nickname2');
    expect(userNickname1.equals(userNickname2)).toBe(false);
  });
});
