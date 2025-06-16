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

export async function userQuery(_data?: UserQueryInput) {
  const result: Result<UserQueryOutput> =
    await window.api.invoke("query:get-user");
  if (!result.isOk()) throw new Error("Usuário não localizado");
  const [user] = result.value;

  if (!user) throw new Error("Usuário não localizado");
  return user;
}

export async function providersQuery(_data?: LLMProviderQueryInput) {
  const providers: Result<LLMProviderQueryOutput> =
    await window.api.invoke("query:llm-provider");
  if (!providers.isOk()) return [];
  return providers.value;
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

  if (!providerConfig.isOk())
    throw new Error("Não foi possivel salvar a configuração do provedor!");

  return providerConfig.value;
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
  if (!user.isOk()) throw new Error("Não foi possivel criar o usuário!");
  return user.value;
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
