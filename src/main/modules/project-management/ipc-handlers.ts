
import { ipcMain } from 'electron'
import { CqrsDispatcher } from '@/main/kernel/cqrs-dispatcher'
import {
  IpcProjectCreatePayload,
  IpcProjectCreateResponse,
  IpcProjectListResponse,
  IpcProjectRemovePayload,
  IpcProjectRemoveResponse,
} from '@/shared/ipc-types/entities'
import { CreateProjectCommand } from './application/commands/create-project.command'
import { ListProjectsQuery } from './application/queries/list-projects.query'
import { RemoveProjectCommand } from './application/commands/remove-project.command'
import { Project } from './domain/project.entity'

export function registerProjectManagementHandlers(cqrsDispatcher: CqrsDispatcher) {
  ipcMain.handle(
    'project:create',
    async (_, payload: IpcProjectCreatePayload): Promise<IpcProjectCreateResponse> => {
      try {
        const command = new CreateProjectCommand(payload)
        const result = (await cqrsDispatcher.dispatchCommand(command)) as Project
        return { success: true, data: result }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred'
        return { success: false, error: { message } }
      }
    },
  )

  ipcMain.handle('project:list', async (): Promise<IpcProjectListResponse> => {
    try {
      const query = new ListProjectsQuery()
      const result = (await cqrsDispatcher.dispatchQuery(query)) as Project[]
      return { success: true, data: result }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred'
      return { success: false, error: { message } }
    }
  })

  ipcMain.handle(
    'project:remove',
    async (_, payload: IpcProjectRemovePayload): Promise<IpcProjectRemoveResponse> => {
      try {
        const command = new RemoveProjectCommand(payload)
        await cqrsDispatcher.dispatchCommand(command)
        return { success: true }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred'
        return { success: false, error: { message } }
      }
    },
  )
}
