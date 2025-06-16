import {
  UserQueryInput,
  UserQueryOutput,
} from "@/core/application/queries/user.query";
import {
  LLMProviderQueryInput,
  LLMProviderQueryOutput,
} from "@/core/application/queries/llm-provider.query";
import { Result } from "@/shared/result";
import {
  CreateUserUseCaseInput,
  CreateUserUseCaseOutput,
} from "@/core/application/use-cases/user/create-user.usecase";
import {
  CreateLLMProviderConfigUseCaseInput,
  CreateLLMProviderConfigUseCaseOutput,
} from "@/core/application/use-cases/llm-provider/create-llm-provider-config.usecase";
import { AppErrorCode, createAppError } from "@/lib/error-mapping";

export async function userQuery(data?: UserQueryInput) {
  const result: Result<UserQueryOutput> =
    await window.api.invoke("query:get-user");
  const { success } = result;
  if (!success) throw createAppError(AppErrorCode.UserNotFound, result.error);
  const [user] = result.data;

  if (!user) throw createAppError(AppErrorCode.UserNotFound);
  return user;
}

export async function providersQuery(data?: LLMProviderQueryInput) {
  const providers: Result<LLMProviderQueryOutput> =
    await window.api.invoke("query:llm-provider");
  if (!providers.success) return [];
  return providers.data;
}

export async function createLLMProviderConfigUseCase(
  data: CreateLLMProviderConfigUseCaseInput
) {
  const providerConfig: Result<CreateLLMProviderConfigUseCaseOutput> =
    await window.api.invoke("usecase:create-llm-provider-config", {
      name: "default",
      apiKey: data.apiKey,
      llmProviderId: data.llmProviderId,
      modelId: data.modelId,
    });

  if (!providerConfig.success)
    throw createAppError(AppErrorCode.LLMProviderConfigSaveFailed, providerConfig.error);

  return providerConfig.data;
}

export async function createUserUseCase(
  data: CreateUserUseCaseInput
): Promise<CreateUserUseCaseOutput> {
  const user: Result<CreateUserUseCaseOutput> = await window.api.invoke(
    "usecase:create-user",
    {
      user: {
        nickname: data.user.nickname,
        email: data.user.email,
        avatarUrl: data.user.avatarUrl,
      },
      llmProviderConfigId: data.llmProviderConfigId,
    }
  );
  if (!user.success) throw createAppError(AppErrorCode.UserCreateFailed, user.error);
  return user.data;
}

export function useCore() {
  return {
    usecase: {
      createLLMProviderConfig: createLLMProviderConfigUseCase,
      createUser: createUserUseCase,
    },
    query: {
      user: userQuery,
      llmProviders: providersQuery,
    },
    command: {},
  };
}
