// src_refactored/core/domain/user/ports/user-repository.interface.ts
import { DomainError } from '@/core/common/errors';

import { Result } from '../../../../shared/result';
import { User } from '../user.entity';
import { UserEmail } from '../value-objects/user-email.vo';
import { UserId } from '../value-objects/user-id.vo';
import { UserUsername } from '../value-objects/user-username.vo';

export interface IUserRepository {
  /**
   * Saves a user entity. This can be used for both creation and updates.
   * Implementations should handle upsert logic if appropriate.
   * @param user The user entity to save.
   * @returns A Result containing the saved user or a DomainError.
   */
  save(user: User): Promise<Result<User, DomainError>>;

  /**
   * Finds a user by their ID.
   * @param id The UserId of the user.
   * @returns A Result containing the user or null if not found, or a DomainError.
   */
  findById(id: UserId): Promise<Result<User | null, DomainError>>;

  /**
   * Finds a user by their email address.
   * @param email The UserEmail of the user.
   * @returns A Result containing the user or null if not found, or a DomainError.
   */
  findByEmail(email: UserEmail): Promise<Result<User | null, DomainError>>;

  /**
   * Finds a user by their username.
   * @param username The UserUsername of the user.
   * @returns A Result containing the user or null if not found, or a DomainError.
   */
  findByUsername(username: UserUsername): Promise<Result<User | null, DomainError>>;

  /**
   * Lists all users.
   * Implementations may add pagination parameters if necessary.
   * @returns A Result containing an array of users or a DomainError.
   */
  listAll(): Promise<Result<User[], DomainError>>;

  /**
   * Deletes a user by their ID.
   * @param id The UserId of the user to delete.
   * @returns A Result containing void or a DomainError.
   */
  delete(id: UserId): Promise<Result<void, DomainError>>;
}

export const IUserRepositoryToken = Symbol('IUserRepository');
