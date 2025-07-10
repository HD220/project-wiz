import type { CqrsDispatcher } from "@/main/kernel/cqrs-dispatcher";
import { createIpcHandler } from "@/main/kernel/ipc-handler-utility";
import { IpcChannel } from "@/shared/ipc-types/ipc-channels";
import type { ILlmConfig } from "@/shared/ipc-types/domain-types";
import type {
  IpcLlmConfigSavePayload,
  IpcLlmConfigGetPayload,
  IpcLlmConfigListPayload,
  IpcLlmConfigRemovePayload,
} from "@/shared/ipc-types/ipc-payloads";
import { SaveLlmConfigCommand, SaveLlmConfigCommandHandler } from "./application/commands/save-llm-config.command";
import { GetLlmConfigQuery, GetLlmConfigQueryHandler } from "./application/queries/get-llm-config.query";
import { ListLlmConfigsQuery, ListLlmConfigsQueryHandler } from "./application/queries/list-llm-configs.query";
import { RemoveLlmConfigCommand, RemoveLlmConfigCommandHandler } from "./application/commands/remove-llm-config.command";
import { DrizzleLlmConfigRepository } from "./persistence/drizzle-llm-config.repository";
import { db } from "@/main/persistence/db";

export function registerLlmIntegrationModule(cqrsDispatcher: CqrsDispatcher) {
  const llmConfigRepository = new DrizzleLlmConfigRepository(db);
  const saveLlmConfigCommandHandler = new SaveLlmConfigCommandHandler(
    llmConfigRepository,
  );
  const getLlmConfigQueryHandler = new GetLlmConfigQueryHandler(
    llmConfigRepository,
  );
  const listLlmConfigsQueryHandler = new ListLlmConfigsQueryHandler(
    llmConfigRepository,
  );
  const removeLlmConfigCommandHandler = new RemoveLlmConfigCommandHandler(
    llmConfigRepository,
  );

  cqrsDispatcher.registerCommandHandler<SaveLlmConfigCommand, ILlmConfig>(
    SaveLlmConfigCommand.name,
    saveLlmConfigCommandHandler.handle.bind(saveLlmConfigCommandHandler),
  );
  cqrsDispatcher.registerQueryHandler<GetLlmConfigQuery, ILlmConfig | undefined>(
    GetLlmConfigQuery.name,
    getLlmConfigQueryHandler.handle.bind(getLlmConfigQueryHandler),
  );
  cqrsDispatcher.registerQueryHandler<ListLlmConfigsQuery, ILlmConfig[]>(
    ListLlmConfigsQuery.name,
    listLlmConfigsQueryHandler.handle.bind(listLlmConfigsQueryHandler),
  );
  cqrsDispatcher.registerCommandHandler<RemoveLlmConfigCommand, boolean>(
    RemoveLlmConfigCommand.name,
    removeLlmConfigCommandHandler.handle.bind(removeLlmConfigCommandHandler),
  );

  createIpcHandler<IpcLlmConfigSavePayload, ILlmConfig>(
    IpcChannel.LLM_CONFIG_SAVE,
    cqrsDispatcher,
    async (payload) => {
      const llmConfig = (await cqrsDispatcher.dispatchCommand(
        new SaveLlmConfigCommand(payload),
      )) as ILlmConfig;
      return llmConfig;
    },
  );

  createIpcHandler<IpcLlmConfigGetPayload, ILlmConfig | undefined>(
    IpcChannel.LLM_CONFIG_GET,
    cqrsDispatcher,
    async (payload) => {
      const llmConfig = (await cqrsDispatcher.dispatchQuery(
        new GetLlmConfigQuery(payload),
      )) as ILlmConfig | undefined;
      return llmConfig;
    },
  );

  createIpcHandler<IpcLlmConfigListPayload, ILlmConfig[]>(
    IpcChannel.LLM_CONFIG_LIST,
    cqrsDispatcher,
    async (payload) => {
      const llmConfigs = (await cqrsDispatcher.dispatchQuery(
        new ListLlmConfigsQuery(payload),
      )) as ILlmConfig[];
      return llmConfigs;
    },
  );

  createIpcHandler<IpcLlmConfigRemovePayload, boolean>(
    IpcChannel.LLM_CONFIG_REMOVE,
    cqrsDispatcher,
    async (payload) => {
      const result = (await cqrsDispatcher.dispatchCommand(
        new RemoveLlmConfigCommand(payload),
      )) as boolean;
      return result;
    },
  );
}

