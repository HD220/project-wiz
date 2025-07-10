import { CqrsDispatcher } from "@/main/kernel/cqrs-dispatcher";
import { ipcMain } from "electron";
import { IpcChannel } from "@/shared/ipc-types/ipc-channels";
import { IProjectStack } from "@/shared/ipc-types/domain-types";
import {
  IpcCodeAnalysisAnalyzeStackPayload,
  IpcCodeAnalysisAnalyzeStackResponse,
} from "@/shared/ipc-types/ipc-payloads";
import { AnalyzeProjectStackQuery } from "./application/queries/analyze-project-stack.query";

export function registerCodeAnalysisModule(cqrsDispatcher: CqrsDispatcher) {
  ipcMain.handle(
    IpcChannel.CODE_ANALYSIS_ANALYZE_STACK,
    async (
      _,
      payload: IpcCodeAnalysisAnalyzeStackPayload,
    ): Promise<IpcCodeAnalysisAnalyzeStackResponse> => {
      try {
        const stack = (await cqrsDispatcher.dispatchQuery(
          new AnalyzeProjectStackQuery(payload),
        )) as IProjectStack;
        return { success: true, data: stack };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "An unknown error occurred";
        return { success: false, error: { message } };
      }
    },
  );
}
