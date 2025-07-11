import { IpcChannel } from "@/shared/ipc-types/ipc-channels";
import { CqrsDispatcher } from "@/main/kernel/cqrs-dispatcher";
import { createIpcHandler } from "@/main/kernel/ipc-handler-utility";

export function registerCodeAnalysisIpcHandlers(cqrsDispatcher: CqrsDispatcher): void {
  createIpcHandler(
    IpcChannel.CODE_ANALYSIS_ANALYZE_STACK,
    cqrsDispatcher,
    async (payload) => {
      // Placeholder for actual logic
      console.log("Analyze stack payload:", payload);
      return { analysisResult: "" };
    },
  );
}
