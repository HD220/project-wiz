import { CqrsDispatcher } from "@/main/kernel/cqrs-dispatcher";
import {
  SaveLlmConfigCommand,
  SaveLlmConfigCommandHandler,
} from "@/main/modules/llm-integration/application/commands/save-llm-config.command";
import {
  GetLlmConfigQuery,
  GetLlmConfigQueryHandler,
} from "@/main/modules/llm-integration/application/queries/get-llm-config.query";
import {
  ListLlmConfigsQuery,
  ListLlmConfigsQueryHandler,
} from "@/main/modules/llm-integration/application/queries/list-llm-configs.query";
import {
  RemoveLlmConfigCommand,
  RemoveLlmConfigCommandHandler,
} from "@/main/modules/llm-integration/application/commands/remove-llm-config.command";
import { LlmConfig } from "@/main/modules/llm-integration/domain/llm-config.entity";
import { DrizzleLlmConfigRepository } from "@/main/modules/llm-integration/persistence/drizzle-llm-config.repository";

function registerLlmConfigHandlers(
  cqrsDispatcher: CqrsDispatcher,
  llmConfigRepository: DrizzleLlmConfigRepository,
  saveLlmConfigCommandHandler: SaveLlmConfigCommandHandler,
  getLlmConfigQueryHandler: GetLlmConfigQueryHandler,
  listLlmConfigsQueryHandler: ListLlmConfigsQueryHandler,
  removeLlmConfigCommandHandler: RemoveLlmConfigCommandHandler,
) {
  cqrsDispatcher.registerCommandHandler<SaveLlmConfigCommand, LlmConfig>(
    "SaveLlmConfigCommand",
    saveLlmConfigCommandHandler.handle.bind(saveLlmConfigCommandHandler),
  );
  cqrsDispatcher.registerQueryHandler<GetLlmConfigQuery, LlmConfig | undefined>(
    "GetLlmConfigQuery",
    getLlmConfigQueryHandler.handle.bind(getLlmConfigQueryHandler),
  );
  cqrsDispatcher.registerQueryHandler<ListLlmConfigsQuery, LlmConfig[]>(
    "ListLlmConfigsQuery",
    listLlmConfigsQueryHandler.handle.bind(listLlmConfigsQueryHandler),
  );
  cqrsDispatcher.registerCommandHandler<RemoveLlmConfigCommand, boolean>(
    "RemoveLlmConfigCommand",
    removeLlmConfigCommandHandler.handle.bind(removeLlmConfigCommandHandler),
  );
}

export function initializeLlmIntegration(cqrsDispatcher: CqrsDispatcher) {
  const llmConfigRepository = new DrizzleLlmConfigRepository();
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

  registerLlmConfigHandlers(
    cqrsDispatcher,
    llmConfigRepository,
    saveLlmConfigCommandHandler,
    getLlmConfigQueryHandler,
    listLlmConfigsQueryHandler,
    removeLlmConfigCommandHandler,
  );
}
