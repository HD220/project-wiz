import { CqrsDispatcher } from "@/main/kernel/cqrs-dispatcher";
import { SaveLlmConfigCommand } from "@/main/modules/llm-integration/application/commands/save-llm-config.command";
import { GetLlmConfigQuery } from "@/main/modules/llm-integration/application/queries/get-llm-config.query";
import { LlmConfig } from "@/main/modules/llm-integration/domain/llm-config.entity";
import { DrizzleLlmConfigRepository } from "@/main/modules/llm-integration/persistence/drizzle-llm-config.repository";

import { SaveLlmConfigCommandHandler } from "@/main/modules/llm-integration/application/commands/save-llm-config.command";
import { GetLlmConfigQueryHandler } from "@/main/modules/llm-integration/application/queries/get-llm-config.query";

describe("LLM Config Get Operations", () => {
  let cqrsDispatcher: CqrsDispatcher;
  let llmConfigRepository: DrizzleLlmConfigRepository;

  

  beforeAll(() => {
    cqrsDispatcher = new CqrsDispatcher();
    llmConfigRepository = new DrizzleLlmConfigRepository();

    const saveLlmConfigCommandHandler = new SaveLlmConfigCommandHandler(llmConfigRepository);
    const getLlmConfigQueryHandler = new GetLlmConfigQueryHandler(llmConfigRepository);

    cqrsDispatcher.registerCommandHandler("SaveLlmConfigCommand", saveLlmConfigCommandHandler.handle.bind(saveLlmConfigCommandHandler));
    cqrsDispatcher.registerQueryHandler("GetLlmConfigQuery", getLlmConfigQueryHandler.handle.bind(getLlmConfigQueryHandler));
  });

  beforeEach(async () => {
    
  });

  it("should get LLM config by ID", async () => {
    const createCommand = new SaveLlmConfigCommand({
      provider: "by-id", model: "model-id", apiKey: "id-key", temperature: 0.3, maxTokens: 300
    });
    const createdConfig = await cqrsDispatcher.dispatchCommand<SaveLlmConfigCommand, LlmConfig>(createCommand);
    expect(createdConfig).toBeInstanceOf(LlmConfig);

    const configId = createdConfig.id;
    const getQuery = new GetLlmConfigQuery({ id: configId });
    const retrievedConfig = await cqrsDispatcher.dispatchQuery<GetLlmConfigQuery, LlmConfig>(getQuery);

    expect(retrievedConfig.id).toBe(configId);
    expect(retrievedConfig.model).toBe("model-id");
  });

  it("should get LLM config by provider and model", async () => {
    await cqrsDispatcher.dispatchCommand(new SaveLlmConfigCommand({
      provider: "by-provider-model", model: "specific-model", apiKey: "pm-key", temperature: 0.6, maxTokens: 600
    }));

    const getQuery = new GetLlmConfigQuery({ provider: "by-provider-model", model: "specific-model" });
    const retrievedConfig = await cqrsDispatcher.dispatchQuery<GetLlmConfigQuery, LlmConfig>(getQuery);

    expect(retrievedConfig.provider).toBe("by-provider-model");
    expect(retrievedConfig.model).toBe("specific-model");
  });

  it("should return undefined if LLM config not found by ID", async () => {
    const getQuery = new GetLlmConfigQuery({ id: "non-existent-id" });
    const retrievedConfig = await cqrsDispatcher.dispatchQuery<GetLlmConfigQuery, LlmConfig | undefined>(getQuery);

    expect(retrievedConfig).toBeUndefined();
  });

  it("should return undefined if LLM config not found by provider and model", async () => {
    const getQuery = new GetLlmConfigQuery({ provider: "non-existent", model: "non-existent" });
    const retrievedConfig = await cqrsDispatcher.dispatchQuery<GetLlmConfigQuery, LlmConfig | undefined>(getQuery);

    expect(retrievedConfig).toBeUndefined();
  });

  it("should throw error if neither id nor provider/model are provided", async () => {
    const getQuery = new GetLlmConfigQuery({});
    await expect(cqrsDispatcher.dispatchQuery(getQuery)).rejects.toThrow(
      "Either id or provider and model must be provided."
    );
  });
});