import { UserConstructor, User } from "@/core/domain/entities/user";
import { UserId } from "@/core/domain/entities/user/value-objects";
import { IUserRepository } from "@/core/ports/repositories/user.repository";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

export class UserRepositoryDrizzle implements IUserRepository {
  constructor(
    private readonly db: BetterSQLite3Database<Record<string, never>>
  ) {}

  create(props: Omit<UserConstructor, "id">): Promise<User> {
    throw new Error("Method not implemented.");
  }
  load(id: UserId): Promise<User> {
    throw new Error("Method not implemented.");
  }
  save(entity: User): Promise<UserId> {
    throw new Error("Method not implemented.");
  }
}
