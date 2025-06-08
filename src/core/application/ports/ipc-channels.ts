import type { Result } from "@/shared/result";
import type { CreateLLMProviderConfigUseCaseInput } from "@/core/application/use-cases/llm-provider/create-llm-provider-config.usecase";
import type { CreateLLMProviderConfigUseCaseOutput } from "@/core/application/use-cases/llm-provider/create-llm-provider-config.usecase";
import type { CreateUserUseCaseInput } from "@/core/application/use-cases/user/create-user.usecase";
// Removido import de JobId
import type { Job } from "@/core/domain/entities/job/job.entity";
import type { ProcessJobInput } from "@/core/application/use-cases/process-job.schema"; // Adicionar este import

export type IpcChannelsInternal = {
  JOB: {
    CREATE: { request: string; response: string }; // Manter como string se o payload for serializado
    UPDATE: { request: string; response: string }; // Manter como string se o payload for serializado
    CANCEL: { request: string; response: string }; // Manter como string se o payload for serializado
    PROCESS: { request: ProcessJobInput; response: Result<Job> }; // Corrigido
    GET_STATUS: { request: { jobId: string }; response: Result<Job | null> }; // Corrigido
  };
  WORKER: {
    REGISTER: { request: string; response: string };
    UNREGISTER: { request: string; response: string };
  };
  QUERY: {
    GET_USER: { request: void; response: Result<unknown> };
    LLM_PROVIDER: { request: void; response: Result<unknown> };
  };
  USECASE: {
    CREATE_LLM_PROVIDER_CONFIG: {
      request: CreateLLMProviderConfigUseCaseInput;
      response: Result<CreateLLMProviderConfigUseCaseOutput>;
    };
    CREATE_USER: {
      request: CreateUserUseCaseInput;
      response: Result<CreateLLMProviderConfigUseCaseOutput>;
    };
  };
};

type ChannelMap = {
  "query:get-user": IpcChannelsInternal["QUERY"]["GET_USER"];
  "query:llm-provider": IpcChannelsInternal["QUERY"]["LLM_PROVIDER"];
  "usecase:create-llm-provider-config": IpcChannelsInternal["USECASE"]["CREATE_LLM_PROVIDER_CONFIG"];
  "usecase:create-user": IpcChannelsInternal["USECASE"]["CREATE_USER"];
};

export type IpcChannels = IpcChannelsInternal & ChannelMap;

export const IPC_CHANNELS = {
  JOB: {
    CREATE: "job:create",
    UPDATE: "job:update",
    CANCEL: "job:cancel",
    PROCESS: "job:process",
    GET_STATUS: "job:get-status",
  },
  WORKER: {
    REGISTER: "worker:register",
    UNREGISTER: "worker:unregister",
  },
  QUERY: {
    GET_USER: "query:get-user",
    LLM_PROVIDER: "query:llm-provider",
  },
  USECASE: {
    CREATE_LLM_PROVIDER_CONFIG: "usecase:create-llm-provider-config",
    CREATE_USER: "usecase:create-user",
  },
} as const;
