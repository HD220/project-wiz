import type { CqrsDispatcher } from "@/main/kernel/cqrs-dispatcher";
import { createIpcHandler } from "@/main/kernel/ipc-handler-utility";
import { IpcChannel } from "@/shared/ipc-types/ipc-channels";
import type { IProjectStack } from "@/shared/ipc-types/domain-types";
import type {
  IpcCodeAnalysisAnalyzeStackPayload,
} from "@/shared/ipc-types/ipc-payloads";
import { AnalyzeProjectStackQuery, AnalyzeProjectStackQueryHandler } from "./application/queries/analyze-project-stack.query";

export function registerCodeAnalysisModule(cqrsDispatcher: CqrsDispatcher) {
  const analyzeProjectStackQueryHandler = new AnalyzeProjectStackQueryHandler();

  cqrsDispatcher.registerQueryHandler<AnalyzeProjectStackQuery, IProjectStack>(
    AnalyzeProjectStackQuery.name,
    analyzeProjectStackQueryHandler.handle.bind(analyzeProjectStackQueryHandler),
  );

  createIpcHandler<IpcCodeAnalysisAnalyzeStackPayload, IProjectStack>(
    IpcChannel.CODE_ANALYSIS_ANALYZE_STACK,
    cqrsDispatcher,
    async (payload) => {
      const stack = (await cqrsDispatcher.dispatchQuery(
        new AnalyzeProjectStackQuery(payload),
      )) as IProjectStack;
      return stack;
    },
  );
}
