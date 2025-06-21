import { AgentId } from "../agent/value-objects";
import { LLMProviderConfigId } from "../llm-provider-config/value-objects";
import { UserEmail, UserId } from "./value-objects";
import { UserAvatar } from "./value-objects/user-avatar.vo";
import { UserNickname } from "./value-objects/user-nickname.vo";
import { UserUsername } from "./value-objects/user-username.vo";

export type UserConstructor = {
  id: UserId;
  nickname: UserNickname;
  username: UserUsername;
  email: UserEmail;
  avatar: UserAvatar;
  defaultLLMProviderConfigId: LLMProviderConfigId;
  assistantId?: AgentId;
};

// TODO: OBJECT_CALISTHENICS_REFACTOR: This class is undergoing refactoring.
// The `getProps()` method is a temporary measure for external consumers.
// Ideally, direct state access will be replaced by more behavior-oriented methods.
export class User {
  constructor(private readonly fields: UserConstructor) {
    // Validate mandatory fields
    if (
      !fields.id ||
      !fields.nickname ||
      !fields.username ||
      !fields.email ||
      !fields.avatar ||
      !fields.defaultLLMProviderConfigId
    ) {
      throw new Error(
        "User ID, Nickname, Username, Email, Avatar, and DefaultLLMProviderConfigId are mandatory."
      );
    }
  }

  public id(): UserId {
    return this.fields.id;
  }

  public getProps(): Readonly<UserConstructor> {
    return { ...this.fields };
  }

  // Individual getters removed (except id() method above)
  // get nickname() { return this.fields.nickname; }
  // get username() { return this.fields.username; }
  // get email() { return this.fields.email; }
  // get avatar() { return this.fields.avatar; }
  // get defaultLLMProviderConfigId() { return this.fields.defaultLLMProviderConfigId; }
  // get assistantId() { return this.fields.assistantId; }

  public equals(other?: User): boolean {
    if (this === other) return true;
    if (!other || !(other instanceof User)) return false;

    if (!this.fields.id.equals(other.fields.id)) return false;
    if (!this.fields.nickname.equals(other.fields.nickname)) return false;
    if (!this.fields.username.equals(other.fields.username)) return false;
    if (!this.fields.email.equals(other.fields.email)) return false;
    if (!this.fields.avatar.equals(other.fields.avatar)) return false;
    if (!this.fields.defaultLLMProviderConfigId.equals(other.fields.defaultLLMProviderConfigId)) return false;

    const assistantId1 = this.fields.assistantId;
    const assistantId2 = other.fields.assistantId;
    if (assistantId1 && assistantId2 && !assistantId1.equals(assistantId2)) return false;
    if ((assistantId1 && !assistantId2) || (!assistantId1 && assistantId2)) return false;

    return true;
  }

  public changeAvatar(newAvatar: UserAvatar): User {
    return new User({ ...this.fields, avatar: newAvatar });
  }

  public changeNickname(newNickname: UserNickname): User {
    return new User({ ...this.fields, nickname: newNickname });
  }

  public setDefaultLLMConfig(newConfigId: LLMProviderConfigId): User {
    return new User({ ...this.fields, defaultLLMProviderConfigId: newConfigId });
  }

  public setAssistant(newAssistantId?: AgentId): User {
    return new User({ ...this.fields, assistantId: newAssistantId });
  }
}
