import { injectable } from "inversify";

import { IUserRepository } from "@/core/domain/user/ports/user-repository.interface";
import { User } from "@/core/domain/user/user.entity";
import { UserEmail } from "@/core/domain/user/value-objects/user-email.vo";
import { UserId } from "@/core/domain/user/value-objects/user-id.vo";
import { UserUsername } from "@/core/domain/user/value-objects/user-username.vo";

import { DomainError, NotFoundError } from "@/domain/common/errors";

import { Result, Ok, Err } from "@/shared/result";

@injectable()
export class InMemoryUserRepository implements IUserRepository {
  private readonly users: Map<string, User> = new Map();

  async save(user: User): Promise<Result<User, DomainError>> {
    this.users.set(user.id.value, user);
    return Ok(user);
  }

  async findById(id: UserId): Promise<Result<User | null, DomainError>> {
    const user = this.users.get(id.value);
    return Ok(user || null);
  }

  async findByEmail(
    email: UserEmail
  ): Promise<Result<User | null, DomainError>> {
    for (const user of this.users.values()) {
      if (user.email().equals(email)) {
        return Ok(user);
      }
    }
    return Ok(null);
  }

  async findByUsername(
    username: UserUsername
  ): Promise<Result<User | null, DomainError>> {
    for (const user of this.users.values()) {
      if (user.username().equals(username)) {
        // Assuming username() getter returns UserUsername VO
        return Ok(user);
      }
    }
    return Ok(null);
  }

  async listAll(): Promise<Result<User[], DomainError>> {
    return Ok(Array.from(this.users.values()));
  }

  async delete(id: UserId): Promise<Result<void, DomainError | NotFoundError>> {
    if (!this.users.has(id.value)) {
      return Err(new NotFoundError(`User with ID ${id.value} not found.`));
    }
    this.users.delete(id.value);
    return Ok(undefined);
  }
}
