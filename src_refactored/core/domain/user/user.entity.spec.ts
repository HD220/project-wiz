// src_refactored/core/domain/user/user.entity.spec.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { User, UserProps } from './user.entity';
import { UserId } from './value-objects/user-id.vo';
import { UserNickname } from './value-objects/user-nickname.vo';
import { UserUsername } from './value-objects/user-username.vo';
import { UserEmail } from './value-objects/user-email.vo';
import { UserAvatar } from './value-objects/user-avatar.vo';
import { Identity } from '@/core/common/value-objects/identity.vo';
import { EntityError, ValueError } from '@/core/common/errors';

describe('User Entity', () => {
  let validProps: UserProps;

  beforeEach(() => {
    validProps = {
      id: UserId.generate(),
      nickname: UserNickname.create('TestUser'),
      username: UserUsername.create('testuser123'),
      email: UserEmail.create('test@example.com'),
      avatar: UserAvatar.create('http://example.com/avatar.png'),
      defaultLLMProviderConfigId: Identity.generate(),
      assistantId: Identity.generate(),
    };
  });

  it('should create a User entity with valid properties', () => {
    const user = User.create(validProps);
    expect(user).toBeInstanceOf(User);
    expect(user.id().equals(validProps.id)).toBe(true);
    expect(user.nickname().value()).toBe('TestUser');
    expect(user.username().value()).toBe('testuser123');
    expect(user.email().value()).toBe('test@example.com');
    expect(user.avatar().value()).toBe('http://example.com/avatar.png');
    expect(user.defaultLLMProviderConfigId().equals(validProps.defaultLLMProviderConfigId)).toBe(true);
    expect(user.assistantId()?.equals(validProps.assistantId)).toBe(true);
    expect(user.createdAt()).toBeInstanceOf(Date);
    expect(user.updatedAt()).toBeInstanceOf(Date);
    expect(user.createdAt()).toEqual(user.updatedAt()); // Initially same
  });

  it('should allow assistantId to be null', () => {
    const propsWithNullAssistant = { ...validProps, assistantId: null };
    const user = User.create(propsWithNullAssistant);
    expect(user.assistantId()).toBeNull();
  });

  it('should default assistantId to null if undefined', () => {
    const propsWithoutAssistant = { ...validProps };
    delete propsWithoutAssistant.assistantId; // Make it undefined
    const user = User.create(propsWithoutAssistant);
    expect(user.assistantId()).toBeNull();
  });

  it('should throw EntityError if required properties are missing', () => {
    expect(() => User.create({ ...validProps, id: undefined } as any)).toThrow(EntityError);
    expect(() => User.create({ ...validProps, nickname: undefined } as any)).toThrow(EntityError);
    // ... test other required fields
  });

  describe('updateProfile', () => {
    it('should update nickname and avatar and change updatedAt', () => {
      const user = User.create(validProps);
      const originalUpdatedAt = user.updatedAt();
      const newNickname = UserNickname.create('NewNick');
      const newAvatar = UserAvatar.create('http://example.com/new.png');

      // Ensure a small delay for updatedAt comparison
      return new Promise(resolve => setTimeout(() => {
        const updatedUser = user.updateProfile({ nickname: newNickname, avatar: newAvatar });
        expect(updatedUser.nickname().equals(newNickname)).toBe(true);
        expect(updatedUser.avatar().equals(newAvatar)).toBe(true);
        expect(updatedUser.updatedAt().getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
        expect(updatedUser.id().equals(user.id())).toBe(true); // ID remains the same
        resolve(null);
      }, 10));
    });

    it('should return the same instance if no properties are changed', () => {
      const user = User.create(validProps);
      const updatedUser = user.updateProfile({ nickname: validProps.nickname });
      expect(updatedUser).toBe(user); // Should be the exact same instance
      expect(updatedUser.updatedAt()).toEqual(user.updatedAt());
    });
  });

  describe('changeEmail', () => {
    it('should update email and change updatedAt', () => {
      const user = User.create(validProps);
      const originalUpdatedAt = user.updatedAt();
      const newEmail = UserEmail.create('new.email@example.com');

      return new Promise(resolve => setTimeout(() => {
        const updatedUser = user.changeEmail(newEmail);
        expect(updatedUser.email().equals(newEmail)).toBe(true);
        expect(updatedUser.updatedAt().getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
        resolve(null);
      }, 10));
    });

    it('should throw ValueError if new email is null', () => {
      const user = User.create(validProps);
      expect(() => user.changeEmail(null as any)).toThrow(ValueError);
    });
  });

  describe('changeUsername', () => {
    it('should update username and change updatedAt', () => {
      const user = User.create(validProps);
      const originalUpdatedAt = user.updatedAt();
      const newUsername = UserUsername.create('newusername');

      return new Promise(resolve => setTimeout(() => {
        const updatedUser = user.changeUsername(newUsername);
        expect(updatedUser.username().equals(newUsername)).toBe(true);
        expect(updatedUser.updatedAt().getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
        resolve(null);
      }, 10));
    });

    it('should throw ValueError if new username is null', () => {
      const user = User.create(validProps);
      expect(() => user.changeUsername(null as any)).toThrow(ValueError);
    });
  });

  describe('setDefaultLLMProviderConfig', () => {
    it('should update defaultLLMProviderConfigId and change updatedAt', () => {
      const user = User.create(validProps);
      const originalUpdatedAt = user.updatedAt();
      const newConfigId = Identity.generate();

      return new Promise(resolve => setTimeout(() => {
        const updatedUser = user.setDefaultLLMProviderConfig(newConfigId);
        expect(updatedUser.defaultLLMProviderConfigId().equals(newConfigId)).toBe(true);
        expect(updatedUser.updatedAt().getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
        resolve(null);
      }, 10));
    });
  });

  describe('assignAssistant', () => {
    it('should update assistantId and change updatedAt', () => {
      const user = User.create(validProps);
      const originalUpdatedAt = user.updatedAt();
      const newAssistantId = Identity.generate();

      return new Promise(resolve => setTimeout(() => {
        const updatedUser = user.assignAssistant(newAssistantId);
        expect(updatedUser.assistantId()?.equals(newAssistantId)).toBe(true);
        expect(updatedUser.updatedAt().getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
        resolve(null);
      }, 10));
    });

    it('should set assistantId to null and change updatedAt', () => {
      const user = User.create(validProps); // Assumes validProps.assistantId is not null
      expect(user.assistantId()).not.toBeNull();
      const originalUpdatedAt = user.updatedAt();

      return new Promise(resolve => setTimeout(() => {
        const updatedUser = user.assignAssistant(null);
        expect(updatedUser.assistantId()).toBeNull();
        expect(updatedUser.updatedAt().getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
        resolve(null);
      }, 10));
    });
  });

  describe('equals', () => {
    it('should return true for entities with the same ID', () => {
      const id = UserId.generate();
      const user1 = User.create({ ...validProps, id });
      const user2 = User.create({ ...validProps, id, nickname: UserNickname.create('OtherNick') });
      expect(user1.equals(user2)).toBe(true);
    });

    it('should return false for entities with different IDs', () => {
      const user1 = User.create(validProps);
      const user2 = User.create({ ...validProps, id: UserId.generate() });
      expect(user1.equals(user2)).toBe(false);
    });

    it('should return false when comparing with null or undefined', () => {
      const user = User.create(validProps);
      expect(user.equals(null)).toBe(false);
      expect(user.equals(undefined)).toBe(false);
    });
  });
});
