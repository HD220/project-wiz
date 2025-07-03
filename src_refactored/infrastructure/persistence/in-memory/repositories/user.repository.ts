import { injectable } from "inversify";

import { NotFoundError } from "@/core/domain/common/errors";
import { IUserRepository } from "@/core/domain/user/ports/user-repository.interface";
import { User } from "@/core/domain/user/user.entity";
import { UserEmail } from "@/core/domain/user/value-objects/user-email.vo";
import { UserId } from "@/core/domain/user/value-objects/user-id.vo";
import { UserUsername } from "@/core/domain/user/value-objects/user-username.vo";


@injectable()
export class InMemoryUserRepository implements IUserRepository {
  private readonly users: Map<string, User> = new Map();

  async save(user: User): Promise<User> {
    this.users.set(user.id.value, user);
    return user;
  }

  async findById(id: UserId): Promise<User | null> {
    const user = this.users.get(id.value);
    return user || null;
  }

  async findByEmail(email: UserEmail): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email.equals(email)) {
        return user;
      }
    }
    return null;
  }

  async findByUsername(username: UserUsername): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.username.equals(username)) {
        return user;
      }
    }
    return null;
  }

  async listAll(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async delete(id: UserId): Promise<void> {
    if (!this.users.has(id.value)) {
      throw new NotFoundError("User", id.value);
    }
    this.users.delete(id.value);
  }
}