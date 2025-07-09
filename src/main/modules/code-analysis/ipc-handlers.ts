
import { ipcMain } from 'electron'
import { CqrsDispatcher } from '@/main/kernel/cqrs-dispatcher'
import {
  IProjectStack,
  IpcCodeAnalysisAnalyzeStackPayload,
  IpcCodeAnalysisAnalyzeStackResponse,
} from '@/shared/ipc-types/entities'
import { AnalyzeProjectStackQuery } from './application/queries/analyze-project-stack.query'

export function registerCodeAnalysisHandlers(cqrsDispatcher: CqrsDispatcher) {
  ipcMain.handle(
    'code-analysis:analyze-stack',
    async (
      _,
      payload: IpcCodeAnalysisAnalyzeStackPayload,
    ): Promise<IpcCodeAnalysisAnalyzeStackResponse> => {
      try {
        const stack = (await cqrsDispatcher.dispatchQuery(
          new AnalyzeProjectStackQuery(payload),
        )) as IProjectStack
        return { success: true, data: stack }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred'
        return { success: false, error: { message } }
      }
    },
  )
}
