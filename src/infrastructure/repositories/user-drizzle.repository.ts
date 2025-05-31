import { UserConstructor, User } from "@/core/domain/entities/user";
import {
  UserAvatar,
  UserEmail,
  UserId,
  UserNickname,
  UserUsername,
} from "@/core/domain/entities/user/value-objects";
import { IUserRepository } from "@/core/ports/repositories/user.interface";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { users } from "../services/drizzle/schemas/users";
import { LLMProviderConfigId } from "@/core/domain/entities/llm-provider-config/value-objects";

export class UserRepositoryDrizzle implements IUserRepository {
  constructor(
    private readonly db: BetterSQLite3Database<Record<string, never>>
  ) {}
  async create(props: Omit<UserConstructor, "id">): Promise<User> {
    const [inserted] = await this.db
      .insert(users)
      .values({
        nickname: props.nickname.value,
        username: props.username.value,
        email: props.email.value,
        avatar: props.avatar.value,
        llmProviderConfigId: `${props.defaultLLMProviderConfigId.value}`,
      })
      .returning();

    return new User({
      id: new UserId(inserted.id),
      nickname: new UserNickname(inserted.nickname),
      username: new UserUsername(inserted.username),
      avatar: new UserAvatar(inserted.avatar),
      email: new UserEmail(inserted.email),
      defaultLLMProviderConfigId: new LLMProviderConfigId(
        inserted.llmProviderConfigId
      ),
    });
  }
  load(id: UserId): Promise<User> {
    throw new Error("Method not implemented.");
  }
  save(entity: User): Promise<User> {
    throw new Error("Method not implemented.");
  }
  async list(): Promise<User[]> {
    const usersDb = await this.db.select().from(users);

    return usersDb.map(
      (user) =>
        new User({
          id: new UserId(user.id),
          nickname: new UserNickname(user.nickname),
          username: new UserUsername(user.username),
          avatar: new UserAvatar(user.avatar),
          email: new UserEmail(user.email),
          defaultLLMProviderConfigId: new LLMProviderConfigId(
            user.llmProviderConfigId
          ),
        })
    );
  }
  delete(id: UserId): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
