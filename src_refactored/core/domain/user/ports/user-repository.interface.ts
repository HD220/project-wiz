import { DomainError } from "@/domain/common/errors";

import { Result } from "../../../../shared/result";
import { User } from "../user.entity";
import { UserEmail } from "../value-objects/user-email.vo";
import { UserId } from "../value-objects/user-id.vo";
import { UserUsername } from "../value-objects/user-username.vo";

export interface IUserRepository {
  save(user: User): Promise<Result<User, DomainError>>;
  findById(id: UserId): Promise<Result<User | null, DomainError>>;
  findByEmail(email: UserEmail): Promise<Result<User | null, DomainError>>;
  findByUsername(
    username: UserUsername
  ): Promise<Result<User | null, DomainError>>;
  listAll(): Promise<Result<User[], DomainError>>;
  delete(id: UserId): Promise<Result<void, DomainError>>;
}

export const IUserRepositoryToken = Symbol("IUserRepository");
