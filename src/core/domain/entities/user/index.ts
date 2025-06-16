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

export class User {
  constructor(private readonly fields: UserConstructor) {}

  get id() {
    return this.fields.id;
  }

  get nickname() {
    return this.fields.nickname;
  }
  get username() {
    return this.fields.username;
  }
  get email() {
    return this.fields.email;
  }
  get avatar() {
    return this.fields.avatar;
  }
  get defaultLLMProviderConfigId() {
    return this.fields.defaultLLMProviderConfigId;
  }
  get assistantId() {
    return this.fields.assistantId;
  }
}
