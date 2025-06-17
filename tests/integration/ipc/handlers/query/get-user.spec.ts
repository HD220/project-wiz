import { describe, it, expect, vi, beforeEach } from "vitest";
import { LLMProviderConfigId } from "@/core/domain/entities/llm-provider-config/value-objects";
import { User } from "@/core/domain/entities/user";
import { UserId } from "@/core/domain/entities/user/value-objects/user-id.vo";
import { UserNickname } from "@/core/domain/entities/user/value-objects/user-nickname.vo";
import { UserUsername } from "@/core/domain/entities/user/value-objects/user-username.vo";
import { UserEmail } from "@/core/domain/entities/user/value-objects/user-email.vo";
import { UserAvatar } from "@/core/domain/entities/user/value-objects/user-avatar.vo";
import { ElectronIpcService } from "@/infrastructure/frameworks/electron/electron-ipc.adapter";
import { ok } from "@/shared/result";
import {
  UserQuery,
  UserQueryOutput,
} from "@/core/application/queries/user.query";
import { IUserRepository } from "@/core/ports/repositories/user.interface";

// Mock do IPCChannels
const mockIpcChannels = {
  QUERY_GET_USER: "query:get-user",
};

vi.mock("@/core/application/ports/ipc-channels", () => ({
  IpcChannels: mockIpcChannels,
}));

class UserBuilder {
  private fields = {
    id: new UserId(crypto.randomUUID()),
    nickname: new UserNickname("Test User"),
    username: new UserUsername("testuser"),
    email: new UserEmail("test@example.com"),
    avatar: new UserAvatar("https://example.com/avatar.png"),
    defaultLLMProviderConfigId: new LLMProviderConfigId(crypto.randomUUID()),
  };

  withId(id: UserId): UserBuilder {
    this.fields.id = id;
    return this;
  }

  withNickname(nickname: UserNickname): UserBuilder {
    this.fields.nickname = nickname;
    return this;
  }

  withUsername(username: UserUsername): UserBuilder {
    this.fields.username = username;
    return this;
  }

  withEmail(email: UserEmail): UserBuilder {
    this.fields.email = email;
    return this;
  }

  withAvatar(avatar: UserAvatar): UserBuilder {
    this.fields.avatar = avatar;
    return this;
  }

  withDefaultLLMProviderConfigId(
    defaultLLMProviderConfigId: LLMProviderConfigId
  ): UserBuilder {
    this.fields.defaultLLMProviderConfigId = defaultLLMProviderConfigId;
    return this;
  }

  build(): User {
    return new User(this.fields);
  }
}

const createMockUser = (
  overrides: Partial<{
    id: UserId;
    nickname: UserNickname;
    username: UserUsername;
    email: UserEmail;
    avatar: UserAvatar;
    defaultLLMProviderConfigId: LLMProviderConfigId;
  }> = {}
) => {
  const builder = new UserBuilder();
  if (overrides.id) builder.withId(overrides.id);
  if (overrides.nickname) builder.withNickname(overrides.nickname);
  if (overrides.username) builder.withUsername(overrides.username);
  if (overrides.email) builder.withEmail(overrides.email);
  if (overrides.avatar) builder.withAvatar(overrides.avatar);
  if (overrides.defaultLLMProviderConfigId)
    builder.withDefaultLLMProviderConfigId(
      overrides.defaultLLMProviderConfigId
    );
  return builder.build();
};

describe("Job Query Channels - get-user", () => {
  let mockUserQuery: UserQuery;
  let mockUsers: User[];
  let ipcService: ElectronIpcService;

  beforeEach(() => {
    mockUserQuery = new UserQuery({} as IUserRepository);
    mockUsers = [createMockUser(), createMockUser()];
    ipcService = new ElectronIpcService();

    vi.mocked(mockUserQuery.execute).mockResolvedValue(
      ok(
        mockUsers.map((user) => ({
          id: user.id.value,
          username: user.username.value,
          nickname: user.nickname.value,
          email: user.email.value,
          avatar: user.avatar.value,
          defaultLLMProviderConfigId: user.defaultLLMProviderConfigId.value,
          assistantId: user.assistantId?.value,
        }))
      )
    );
  });

  it("should return list of users when found", async () => {
    const result = await ipcService.invoke<void, UserQueryOutput[]>(
      mockIpcChannels.QUERY_GET_USER
    );

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value).toEqual(
        mockUsers.map((user) => ({
          id: user.id.value,
          username: user.username.value,
          nickname: user.nickname.value,
          email: user.email.value,
          avatar: user.avatar.value,
          defaultLLMProviderConfigId: user.defaultLLMProviderConfigId.value,
          assistantId: user.assistantId?.value,
        }))
      );
    }
    expect(mockUserQuery.execute).toHaveBeenCalled();
  });

  it("should return empty array when no users found", async () => {
    vi.mocked(mockUserQuery.execute).mockResolvedValue(ok([]));

    const result = await ipcService.invoke<void, UserQueryOutput[]>(
      mockIpcChannels.QUERY_GET_USER
    );

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value).toEqual([]);
    }
  });

  it("should validate user structure", async () => {
    const result = await ipcService.invoke<void, UserQueryOutput[]>(
      mockIpcChannels.QUERY_GET_USER
    );

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      const user: UserQueryOutput = result.value[0];
      expect(user).toHaveProperty("id");
      expect(user).toHaveProperty("nickname");
      expect(user).toHaveProperty("username");
      expect(user).toHaveProperty("email");
      expect(user).toHaveProperty("avatar");
    }
  });
});
