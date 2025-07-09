
import { ipcMain } from 'electron'
import { CqrsDispatcher } from '@/main/kernel/cqrs-dispatcher'
import {
  ILlmConfig,
  IpcLlmConfigSavePayload,
  IpcLlmConfigSaveResponse,
  IpcLlmConfigGetPayload,
  IpcLlmConfigGetResponse,
  IpcLlmConfigListPayload,
  IpcLlmConfigListResponse,
  IpcLlmConfigRemovePayload,
  IpcLlmConfigRemoveResponse,
} from '@/shared/ipc-types/entities'
import { SaveLlmConfigCommand } from './application/commands/save-llm-config.command'
import { GetLlmConfigQuery } from './application/queries/get-llm-config.query'
import { ListLlmConfigsQuery } from './application/queries/list-llm-configs.query'
import { RemoveLlmConfigCommand } from './application/commands/remove-llm-config.command'

export function registerLlmIntegrationHandlers(cqrsDispatcher: CqrsDispatcher) {
  ipcMain.handle(
    'llm-config:save',
    async (
      _,
      payload: IpcLlmConfigSavePayload,
    ): Promise<IpcLlmConfigSaveResponse> => {
      try {
        const llmConfig = (await cqrsDispatcher.dispatchCommand(
          new SaveLlmConfigCommand(payload),
        )) as ILlmConfig
        return { success: true, data: llmConfig }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred'
        return { success: false, error: { message } }
      }
    },
  )

  ipcMain.handle(
    'llm-config:get',
    async (
      _,
      payload: IpcLlmConfigGetPayload,
    ): Promise<IpcLlmConfigGetResponse> => {
      try {
        const llmConfig = (await cqrsDispatcher.dispatchQuery(
          new GetLlmConfigQuery(payload),
        )) as ILlmConfig | undefined
        return { success: true, data: llmConfig }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred'
        return { success: false, error: { message } }
      }
    },
  )

  ipcMain.handle(
    'llm-config:list',
    async (
      _,
      payload: IpcLlmConfigListPayload,
    ): Promise<IpcLlmConfigListResponse> => {
      try {
        const llmConfigs = (await cqrsDispatcher.dispatchQuery(
          new ListLlmConfigsQuery(payload),
        )) as ILlmConfig[]
        return { success: true, data: llmConfigs }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred'
        return { success: false, error: { message } }
      }
    },
  )

  ipcMain.handle(
    'llm-config:remove',
    async (
      _,
      payload: IpcLlmConfigRemovePayload,
    ): Promise<IpcLlmConfigRemoveResponse> => {
      try {
        const result = (await cqrsDispatcher.dispatchCommand(
          new RemoveLlmConfigCommand(payload),
        )) as boolean
        return { success: true, data: result }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred'
        return { success: false, error: { message } }
      }
    },
  )
}
