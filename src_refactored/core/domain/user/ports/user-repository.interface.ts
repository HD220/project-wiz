import { User } from "../user.entity";
import { UserEmail } from "../value-objects/user-email.vo";
import { UserId } from "../value-objects/user-id.vo";
import { UserUsername } from "../value-objects/user-username.vo";

export interface IUserRepository {
  save(user: User): Promise<User>;
  findById(id: UserId): Promise<User | null>;
  findByEmail(email: UserEmail): Promise<User | null>;
  findByUsername(username: UserUsername): Promise<User | null>;
  listAll(): Promise<User[]>;
  delete(id: UserId): Promise<void>;
}