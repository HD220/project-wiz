// src_refactored/core/domain/user/value-objects/user-email.vo.spec.ts
import { describe, it, expect } from 'vitest';
import { UserEmail } from './user-email.vo';
import { ValueError } from '@/core/common/errors';

describe('UserEmail', () => {
  it('should create a UserEmail with a valid email and convert to lowercase', () => {
    const email = 'Test.User@Example.COM';
    const userEmail = UserEmail.create(email);
    expect(userEmail).toBeInstanceOf(UserEmail);
    expect(userEmail.value()).toBe('test.user@example.com');
  });

  it('should trim whitespace from email and convert to lowercase', () => {
    const email = '  Test.User@Example.COM  ';
    const userEmail = UserEmail.create(email);
    expect(userEmail.value()).toBe('test.user@example.com');
  });

  it('should throw ValueError if email is empty', () => {
    expect(() => UserEmail.create('')).toThrow(ValueError);
    expect(() => UserEmail.create('   ')).toThrow(ValueError);
  });

  it('should throw ValueError for invalid email formats', () => {
    expect(() => UserEmail.create('plainaddress')).toThrow(ValueError);
    expect(() => UserEmail.create('@missingusername.com')).toThrow(ValueError);
    expect(() => UserEmail.create('username@.com')).toThrow(ValueError); // Domain starting with dot
    expect(() => UserEmail.create('username@domain.')).toThrow(ValueError); // TLD missing
    expect(() => UserEmail.create('username@domain.c')).toThrow(ValueError); // TLD too short
    expect(() => UserEmail.create('username@domain..com')).toThrow(ValueError); // Double dot in domain
    expect(() => UserEmail.create('username domain.com')).toThrow(ValueError); // Space in address
  });

  it('should accept valid email formats', () => {
    const validEmails = [
      'email@example.com',
      'firstname.lastname@example.com',
      'email@subdomain.example.com',
      'firstname+lastname@example.com',
      'email@example-one.com',
      '_______@example.com',
      'email@example.name',
      'email@example.museum',
      'email@example.co.jp',
      'firstname-lastname@example.com',
      '1234567890@example.com',
      'user@localhost', // Common for local dev
    ];
    validEmails.forEach(email => {
      expect(() => UserEmail.create(email)).not.toThrow();
    });
  });

  it('should throw ValueError if email is too long', () => {
    const localPart = 'a'.repeat(64); // Max local part length
    const domainPart = 'b'.repeat(180) + '.com'; // Makes total > 254
    const longEmail = `${localPart}@${domainPart}`;
    expect(longEmail.length).toBeGreaterThan(254);
    expect(() => UserEmail.create(longEmail)).toThrow(ValueError);
  });


  it('should correctly compare two UserEmails with the same value (case-insensitive)', () => {
    const email1 = 'User.Test@Example.ORG';
    const email2 = 'user.test@example.org';
    const userEmail1 = UserEmail.create(email1);
    const userEmail2 = UserEmail.create(email2);
    expect(userEmail1.equals(userEmail2)).toBe(true);
  });

  it('should correctly compare two UserEmails with different values', () => {
    const userEmail1 = UserEmail.create('email1@example.com');
    const userEmail2 = UserEmail.create('email2@example.com');
    expect(userEmail1.equals(userEmail2)).toBe(false);
  });
});
