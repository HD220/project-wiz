import { AbstractEntity, EntityProps } from "@/core/common/base.entity";
import { Identity } from "@/core/common/value-objects/identity.vo";

import { EntityError, ValueError } from "@/domain/common/errors";

import { UserAvatar } from "./value-objects/user-avatar.vo";
import { UserEmail } from "./value-objects/user-email.vo";
import { UserId } from "./value-objects/user-id.vo";
import { UserNickname } from "./value-objects/user-nickname.vo";
import { UserUsername } from "./value-objects/user-username.vo";

export interface UserProps {
  id: UserId;
  nickname: UserNickname;
  username: UserUsername;
  email: UserEmail;
  avatar: UserAvatar;
  defaultLLMProviderConfigId: Identity;
  assistantId?: Identity | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface InternalUserProps extends EntityProps<UserId> {
  nickname: UserNickname;
  username: UserUsername;
  email: UserEmail;
  avatar: UserAvatar;
  defaultLLMProviderConfigId: Identity;
  assistantId?: Identity | null;
}

export class User extends AbstractEntity<UserId, InternalUserProps> {
  private constructor(props: InternalUserProps) {
    super(props);
  }

  public static create(props: UserProps): User {
    this.validateProps(props);

    const now = new Date();
    const internalProps: InternalUserProps = {
      id: props.id,
      nickname: props.nickname,
      username: props.username,
      email: props.email,
      avatar: props.avatar,
      defaultLLMProviderConfigId: props.defaultLLMProviderConfigId,
      assistantId: props.assistantId === undefined ? null : props.assistantId,
      createdAt: props.createdAt || now,
      updatedAt: props.updatedAt || now,
    };

    return new User(internalProps);
  }

  private static validateProps(props: UserProps): void {
    if (!props.id) throw new EntityError("User ID is required.");
    if (!props.nickname) throw new EntityError("User nickname is required.");
    if (!props.username) throw new EntityError("User username is required.");
    if (!props.email) throw new EntityError("User email is required.");
    if (!props.avatar) throw new EntityError("User avatar is required.");
    if (!props.defaultLLMProviderConfigId)
      throw new EntityError("Default LLM Provider Config ID is required.");
  }

  public nickname(): UserNickname {
    return this.props.nickname;
  }
  public username(): UserUsername {
    return this.props.username;
  }
  public email(): UserEmail {
    return this.props.email;
  }
  public avatar(): UserAvatar {
    return this.props.avatar;
  }
  public defaultLLMProviderConfigId(): Identity {
    return this.props.defaultLLMProviderConfigId;
  }
  public assistantId(): Identity | null | undefined {
    return this.props.assistantId;
  }

  public updateProfile(params: {
    nickname?: UserNickname;
    avatar?: UserAvatar;
  }): User {
    const newProps = { ...this.props };
    let updated = false;

    if (params.nickname && !this.props.nickname.equals(params.nickname)) {
      newProps.nickname = params.nickname;
      updated = true;
    }
    if (params.avatar && !this.props.avatar.equals(params.avatar)) {
      newProps.avatar = params.avatar;
      updated = true;
    }

    if (updated) {
      newProps.updatedAt = new Date();
      return new User(newProps);
    }
    return this;
  }

  public changeEmail(newEmail: UserEmail): User {
    if (!newEmail)
      throw new ValueError("New email cannot be null or undefined.");
    if (this.props.email.equals(newEmail)) {
      return this;
    }
    const newProps = { ...this.props, email: newEmail, updatedAt: new Date() };
    return new User(newProps);
  }

  public changeUsername(newUsername: UserUsername): User {
    if (!newUsername)
      throw new ValueError("New username cannot be null or undefined.");
    if (this.props.username.equals(newUsername)) {
      return this;
    }
    const newProps = {
      ...this.props,
      username: newUsername,
      updatedAt: new Date(),
    };
    return new User(newProps);
  }

  public setDefaultLLMProviderConfig(configId: Identity): User {
    if (!configId)
      throw new ValueError(
        "LLM Provider Config ID cannot be null or undefined."
      );
    if (this.props.defaultLLMProviderConfigId.equals(configId)) {
      return this;
    }
    const newProps = {
      ...this.props,
      defaultLLMProviderConfigId: configId,
      updatedAt: new Date(),
    };
    return new User(newProps);
  }

  public assignAssistant(assistantId: Identity | null): User {
    if (
      this.props.assistantId === assistantId ||
      this.props.assistantId?.equals(assistantId)
    ) {
      return this;
    }
    const newProps = {
      ...this.props,
      assistantId: assistantId,
      updatedAt: new Date(),
    };
    return new User(newProps);
  }
}
