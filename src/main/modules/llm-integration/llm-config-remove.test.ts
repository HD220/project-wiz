import { CqrsDispatcher } from "@/main/kernel/cqrs-dispatcher";
import { SaveLlmConfigCommand } from "@/main/modules/llm-integration/application/commands/save-llm-config.command";
import { ListLlmConfigsQuery } from "@/main/modules/llm-integration/application/queries/list-llm-configs.query";
import { LlmConfig } from "@/main/modules/llm-integration/domain/llm-config.entity";
import { RemoveLlmConfigCommand } from "@/main/modules/llm-integration/application/commands/remove-llm-config.command";
import { DrizzleLlmConfigRepository } from "@/main/modules/llm-integration/persistence/drizzle-llm-config.repository";
import { llmConfigs } from "@/main/modules/llm-integration/persistence/schema";
import { db } from "@/main/persistence/db";
import { sql } from "drizzle-orm";
import { SaveLlmConfigCommandHandler } from "@/main/modules/llm-integration/application/commands/save-llm-config.command";
import { ListLlmConfigsQueryHandler } from "@/main/modules/llm-integration/application/queries/list-llm-configs.query";
import { RemoveLlmConfigCommandHandler } from "@/main/modules/llm-integration/application/commands/remove-llm-config.command";

describe("LLM Config Remove Operations", () => {
  let cqrsDispatcher: CqrsDispatcher;
  let llmConfigRepository: DrizzleLlmConfigRepository;

  const clearLlmConfigsTable = async () => {
    await db.delete(llmConfigs).where(sql`1=1`);
  };

  beforeEach(() => {
    cqrsDispatcher = new CqrsDispatcher();
    llmConfigRepository = new DrizzleLlmConfigRepository();

    const saveLlmConfigCommandHandler = new SaveLlmConfigCommandHandler(llmConfigRepository);
    const listLlmConfigsQueryHandler = new ListLlmConfigsQueryHandler(llmConfigRepository);
    const removeLlmConfigCommandHandler = new RemoveLlmConfigCommandHandler(llmConfigRepository);

    cqrsDispatcher.registerCommandHandler("SaveLlmConfigCommand", saveLlmConfigCommandHandler.handle.bind(saveLlmConfigCommandHandler));
    cqrsDispatcher.registerQueryHandler("ListLlmConfigsQuery", listLlmConfigsQueryHandler.handle.bind(listLlmConfigsQueryHandler));
    cqrsDispatcher.registerCommandHandler("RemoveLlmConfigCommand", removeLlmConfigCommandHandler.handle.bind(removeLlmConfigCommandHandler));
  });

  beforeEach(async () => {
    await clearLlmConfigsTable();
  });

  it("should remove an LLM config", async () => {
    const createCommand = new SaveLlmConfigCommand({
      provider: "test", model: "test-model", apiKey: "key-to-remove", temperature: 0.1, maxTokens: 100
    });
    const createdConfig = await cqrsDispatcher.dispatchCommand<SaveLlmConfigCommand, LlmConfig>(createCommand);
    expect(createdConfig).toBeInstanceOf(LlmConfig);

    const configId = createdConfig.id;
    const removeCommand = new RemoveLlmConfigCommand({ id: configId });
    const removeResult = await cqrsDispatcher.dispatchCommand<RemoveLlmConfigCommand, boolean>(removeCommand);

    expect(removeResult).toBe(true);

    const listedConfigs = await cqrsDispatcher.dispatchQuery<ListLlmConfigsQuery, LlmConfig[]>(new ListLlmConfigsQuery());
    expect(listedConfigs.length).toBe(0);
  });
});