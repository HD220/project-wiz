// src_refactored/core/domain/user/value-objects/user-avatar.vo.spec.ts
import { describe, it, expect } from 'vitest';
import { UserAvatar } from './user-avatar.vo';
import { ValueError } from '../../../../common/errors';

describe('UserAvatar', () => {
  it('should create a UserAvatar with a valid URL', () => {
    const url = 'http://example.com/avatar.png';
    const userAvatar = UserAvatar.create(url);
    expect(userAvatar).toBeInstanceOf(UserAvatar);
    expect(userAvatar.value()).toBe(url);
  });

  it('should create a UserAvatar with null if URL is null, undefined, or empty string', () => {
    expect(UserAvatar.create(null).value()).toBeNull();
    expect(UserAvatar.create(undefined).value()).toBeNull();
    expect(UserAvatar.create('').value()).toBeNull();
    expect(UserAvatar.create('   ').value()).toBeNull();
  });

  it('should throw ValueError for invalid URL formats', () => {
    expect(() => UserAvatar.create('not-a-url')).toThrow(ValueError);
    expect(() => UserAvatar.create('ftp://example.com/avatar.png')).toThrow(ValueError); // Invalid protocol
    expect(() => UserAvatar.create('http:/example.com/avatar.png')).toThrow(ValueError); // Malformed
  });

  it('should accept https URLs', () => {
    const url = 'https://example.com/avatar.jpg';
    expect(() => UserAvatar.create(url)).not.toThrow();
    expect(UserAvatar.create(url).value()).toBe(url);
  });

  it('should throw ValueError if URL is too long', () => {
    const longUrl = 'http://example.com/' + 'a'.repeat(2040) + '.png'; // ~2048 +
    expect(longUrl.length).toBeGreaterThan(2048);
    expect(() => UserAvatar.create(longUrl)).toThrow(ValueError);
  });

  it('should correctly compare two UserAvatars with the same URL', () => {
    const url = 'http://example.com/image.gif';
    const userAvatar1 = UserAvatar.create(url);
    const userAvatar2 = UserAvatar.create(url);
    expect(userAvatar1.equals(userAvatar2)).toBe(true);
  });

  it('should correctly compare two UserAvatars with different URLs', () => {
    const userAvatar1 = UserAvatar.create('http://example.com/avatar1.png');
    const userAvatar2 = UserAvatar.create('http://example.com/avatar2.png');
    expect(userAvatar1.equals(userAvatar2)).toBe(false);
  });

  it('should correctly compare a UserAvatar with a URL and one with null', () => {
    const userAvatar1 = UserAvatar.create('http://example.com/avatar1.png');
    const userAvatar2 = UserAvatar.create(null);
    expect(userAvatar1.equals(userAvatar2)).toBe(false);
  });

  it('should correctly compare two UserAvatars that are both null', () => {
    const userAvatar1 = UserAvatar.create(null);
    const userAvatar2 = UserAvatar.create(undefined);
    expect(userAvatar1.equals(userAvatar2)).toBe(true);
  });
});
