import { CqrsDispatcher } from "@/main/kernel/cqrs-dispatcher";
import { ipcMain } from "electron";
import { IpcChannel } from "@/shared/ipc-types/ipc-channels";
import { ILlmConfig } from "@/shared/ipc-types/domain-types";
import {
  IpcLlmConfigSavePayload,
  IpcLlmConfigSaveResponse,
  IpcLlmConfigGetPayload,
  IpcLlmConfigGetResponse,
  IpcLlmConfigListPayload,
  IpcLlmConfigListResponse,
  IpcLlmConfigRemovePayload,
  IpcLlmConfigRemoveResponse,
} from "@/shared/ipc-types/ipc-payloads";
import { SaveLlmConfigCommand } from "./application/commands/save-llm-config.command";
import { GetLlmConfigQuery } from "./application/queries/get-llm-config.query";
import { ListLlmConfigsQuery } from "./application/queries/list-llm-configs.query";
import { RemoveLlmConfigCommand } from "./application/commands/remove-llm-config.command";

export function registerLlmIntegrationModule(cqrsDispatcher: CqrsDispatcher) {
  handleLlmConfigSave(cqrsDispatcher);
  handleLlmConfigGet(cqrsDispatcher);
  handleLlmConfigList(cqrsDispatcher);
  handleLlmConfigRemove(cqrsDispatcher);
}

function handleLlmConfigSave(cqrsDispatcher: CqrsDispatcher) {
  ipcMain.handle(
    IpcChannel.LLM_CONFIG_SAVE,
    async (
      _,
      payload: IpcLlmConfigSavePayload,
    ): Promise<IpcLlmConfigSaveResponse> => {
      try {
        const llmConfig = (await cqrsDispatcher.dispatchCommand(
          new SaveLlmConfigCommand(payload),
        )) as ILlmConfig;
        return { success: true, data: llmConfig };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "An unknown error occurred";
        return { success: false, error: { message } };
      }
    },
  );
}

function handleLlmConfigGet(cqrsDispatcher: CqrsDispatcher) {
  ipcMain.handle(
    IpcChannel.LLM_CONFIG_GET,
    async (
      _,
      payload: IpcLlmConfigGetPayload,
    ): Promise<IpcLlmConfigGetResponse> => {
      try {
        const llmConfig = (await cqrsDispatcher.dispatchQuery(
          new GetLlmConfigQuery(payload),
        )) as ILlmConfig | undefined;
        return { success: true, data: llmConfig };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "An unknown error occurred";
        return { success: false, error: { message } };
      }
    },
  );
}

function handleLlmConfigList(cqrsDispatcher: CqrsDispatcher) {
  ipcMain.handle(
    IpcChannel.LLM_CONFIG_LIST,
    async (
      _,
      payload: IpcLlmConfigListPayload,
    ): Promise<IpcLlmConfigListResponse> => {
      try {
        const llmConfigs = (await cqrsDispatcher.dispatchQuery(
          new ListLlmConfigsQuery(payload),
        )) as ILlmConfig[];
        return { success: true, data: llmConfigs };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "An unknown error occurred";
        return { success: false, error: { message } };
      }
    },
  );
}

function handleLlmConfigRemove(cqrsDispatcher: CqrsDispatcher) {
  ipcMain.handle(
    IpcChannel.LLM_CONFIG_REMOVE,
    async (
      _,
      payload: IpcLlmConfigRemovePayload,
    ): Promise<IpcLlmConfigRemoveResponse> => {
      try {
        const result = (await cqrsDispatcher.dispatchCommand(
          new RemoveLlmConfigCommand(payload),
        )) as boolean;
        return { success: true, data: result };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "An unknown error occurred";
        return { success: false, error: { message } };
      }
    },
  );
}
