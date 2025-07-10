import { CqrsDispatcher } from "@/main/kernel/cqrs-dispatcher";
import {
  AnalyzeProjectStackQuery,
  AnalyzeProjectStackQueryHandler,
} from "@/main/modules/code-analysis/application/queries/analyze-project-stack.query";
import { ProjectStack } from "@/main/modules/code-analysis/domain/project-stack.entity";

function registerCodeAnalysisHandlers(
  cqrsDispatcher: CqrsDispatcher,
  analyzeProjectStackQueryHandler: AnalyzeProjectStackQueryHandler,
) {
  cqrsDispatcher.registerQueryHandler<AnalyzeProjectStackQuery, ProjectStack>(
    "AnalyzeProjectStackQuery",
    analyzeProjectStackQueryHandler.handle.bind(
      analyzeProjectStackQueryHandler,
    ),
  );
}

export function initializeCodeAnalysis(cqrsDispatcher: CqrsDispatcher) {
  const analyzeProjectStackQueryHandler = new AnalyzeProjectStackQueryHandler();

  registerCodeAnalysisHandlers(cqrsDispatcher, analyzeProjectStackQueryHandler);
}
