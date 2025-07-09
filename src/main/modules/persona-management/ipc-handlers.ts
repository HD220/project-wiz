
import { ipcMain } from 'electron'
import { CqrsDispatcher } from '@/main/kernel/cqrs-dispatcher'
import {
  IPersona,
  IpcPersonaRefineSuggestionPayload,
  IpcPersonaRefineSuggestionResponse,
  IpcPersonaCreatePayload,
  IpcPersonaCreateResponse,
  IpcPersonaListPayload,
  IpcPersonaListResponse,
  IpcPersonaRemovePayload,
  IpcPersonaRemoveResponse,
} from '@/shared/ipc-types/entities'
import { RefinePersonaSuggestionCommand } from './application/commands/refine-persona-suggestion.command'
import { CreatePersonaCommand } from './application/commands/create-persona.command'
import { ListPersonasQuery } from './application/queries/list-personas.query'
import { RemovePersonaCommand } from './application/commands/remove-persona.command'

export function registerPersonaManagementHandlers(cqrsDispatcher: CqrsDispatcher) {
  ipcMain.handle(
    'persona:refine-suggestion',
    async (
      _,
      payload: IpcPersonaRefineSuggestionPayload,
    ): Promise<IpcPersonaRefineSuggestionResponse> => {
      try {
        const result = (await cqrsDispatcher.dispatchCommand(
          new RefinePersonaSuggestionCommand(payload),
        )) as IPersona
        return { success: true, data: result }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred'
        return { success: false, error: { message } }
      }
    },
  )

  ipcMain.handle(
    'persona:create',
    async (
      _,
      payload: IpcPersonaCreatePayload,
    ): Promise<IpcPersonaCreateResponse> => {
      try {
        const persona = (await cqrsDispatcher.dispatchCommand(
          new CreatePersonaCommand(payload),
        )) as IPersona
        return { success: true, data: persona }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred'
        return { success: false, error: { message } }
      }
    },
  )

  ipcMain.handle(
    'persona:list',
    async (
      _,
      payload: IpcPersonaListPayload,
    ): Promise<IpcPersonaListResponse> => {
      try {
        const personas = (await cqrsDispatcher.dispatchQuery(
          new ListPersonasQuery(payload),
        )) as IPersona[]
        return { success: true, data: personas }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred'
        return { success: false, error: { message } }
      }
    },
  )

  ipcMain.handle(
    'persona:remove',
    async (
      _,
      payload: IpcPersonaRemovePayload,
    ): Promise<IpcPersonaRemoveResponse> => {
      try {
        const result = (await cqrsDispatcher.dispatchCommand(
          new RemovePersonaCommand(payload),
        )) as boolean
        return { success: true, data: result }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred'
        return { success: false, error: { message } }
      }
    },
  )
}
