import { CqrsDispatcher } from "@/main/kernel/cqrs-dispatcher";
import { SaveLlmConfigCommand } from "@/main/modules/llm-integration/application/commands/save-llm-config.command";
import { ListLlmConfigsQuery } from "@/main/modules/llm-integration/application/queries/list-llm-configs.query";
import { DrizzleLlmConfigRepository } from "@/main/modules/llm-integration/persistence/drizzle-llm-config.repository";
import { LlmConfig } from "@/main/modules/llm-integration/domain/llm-config.entity";

import { SaveLlmConfigCommandHandler } from "@/main/modules/llm-integration/application/commands/save-llm-config.command";
import { ListLlmConfigsQueryHandler } from "@/main/modules/llm-integration/application/queries/list-llm-configs.query";

describe("LLM Config Save Operations", () => {
  let cqrsDispatcher: CqrsDispatcher;
  let llmConfigRepository: DrizzleLlmConfigRepository;

  

  beforeEach(() => {
    cqrsDispatcher = new CqrsDispatcher();
    llmConfigRepository = new DrizzleLlmConfigRepository();

    const saveLlmConfigCommandHandler = new SaveLlmConfigCommandHandler(llmConfigRepository);
    const listLlmConfigsQueryHandler = new ListLlmConfigsQueryHandler(llmConfigRepository);

    cqrsDispatcher.registerCommandHandler("SaveLlmConfigCommand", saveLlmConfigCommandHandler.handle.bind(saveLlmConfigCommandHandler));
    cqrsDispatcher.registerQueryHandler("ListLlmConfigsQuery", listLlmConfigsQueryHandler.handle.bind(listLlmConfigsQueryHandler));
  });

  beforeEach(async () => {
    
  });

  it("should save a new LLM config", async () => {
    const command = new SaveLlmConfigCommand({
      provider: "openai",
      model: "gpt-3.5-turbo",
      apiKey: "sk-test-key",
      temperature: 0.7,
      maxTokens: 1000,
    });
    const savedConfig = await cqrsDispatcher.dispatchCommand<SaveLlmConfigCommand, LlmConfig>(command);

    expect(savedConfig).toBeInstanceOf(LlmConfig);
    expect(savedConfig.provider).toBe("openai");

    const listedConfigs = await cqrsDispatcher.dispatchQuery<ListLlmConfigsQuery, LlmConfig[]>(new ListLlmConfigsQuery());
    expect(listedConfigs.length).toBe(1);
    expect(listedConfigs[0].model).toBe("gpt-3.5-turbo");
  });
});