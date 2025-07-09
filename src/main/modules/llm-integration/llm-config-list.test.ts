import { CqrsDispatcher } from "@/main/kernel/cqrs-dispatcher";
import { SaveLlmConfigCommand } from "@/main/modules/llm-integration/application/commands/save-llm-config.command";
import { ListLlmConfigsQuery } from "@/main/modules/llm-integration/application/queries/list-llm-configs.query";
import { DrizzleLlmConfigRepository } from "@/main/modules/llm-integration/persistence/drizzle-llm-config.repository";

import { SaveLlmConfigCommandHandler } from "@/main/modules/llm-integration/application/commands/save-llm-config.command";
import { LlmConfig } from "@/main/modules/llm-integration/domain/llm-config.entity";
import { ListLlmConfigsQueryHandler } from "@/main/modules/llm-integration/application/queries/list-llm-configs.query";

describe("LLM Config List Operations", () => {
  let cqrsDispatcher: CqrsDispatcher;
  let llmConfigRepository: DrizzleLlmConfigRepository;

  

  beforeAll(() => {
    cqrsDispatcher = new CqrsDispatcher();
    llmConfigRepository = new DrizzleLlmConfigRepository();

    const saveLlmConfigCommandHandler = new SaveLlmConfigCommandHandler(llmConfigRepository);
    const listLlmConfigsQueryHandler = new ListLlmConfigsQueryHandler(llmConfigRepository);

    cqrsDispatcher.registerCommandHandler("SaveLlmConfigCommand", saveLlmConfigCommandHandler.handle.bind(saveLlmConfigCommandHandler));
    cqrsDispatcher.registerQueryHandler("ListLlmConfigsQuery", listLlmConfigsQueryHandler.handle.bind(listLlmConfigsQueryHandler));
  });

  beforeEach(async () => {
    
  });

  it("should list all LLM configs", async () => {
    await cqrsDispatcher.dispatchCommand(new SaveLlmConfigCommand({
      provider: "openai", model: "gpt-3.5", apiKey: "key1", temperature: 0.5, maxTokens: 500
    }));
    await cqrsDispatcher.dispatchCommand(new SaveLlmConfigCommand({
      provider: "google", model: "gemini-pro", apiKey: "key2", temperature: 0.8, maxTokens: 1500
    }));

    const listedConfigs = await cqrsDispatcher.dispatchQuery<ListLlmConfigsQuery, LlmConfig[]>(new ListLlmConfigsQuery());

    expect(listedConfigs.length).toBe(2);
    expect(listedConfigs[0].provider).toBe("openai");
    expect(listedConfigs[1].provider).toBe("google");
  });
});