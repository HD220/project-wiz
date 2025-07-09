import { CqrsDispatcher } from "@/main/kernel/cqrs-dispatcher";
import { SaveLlmConfigCommand } from "@/main/modules/llm-integration/application/commands/save-llm-config.command";
import { GetLlmConfigQuery } from "@/main/modules/llm-integration/application/queries/get-llm-config.query";
import { LlmConfig } from "@/main/modules/llm-integration/domain/llm-config.entity";
import { DrizzleLlmConfigRepository } from "@/main/modules/llm-integration/persistence/drizzle-llm-config.repository";
import { llmConfigs } from "@/main/modules/llm-integration/persistence/schema";
import { db } from "@/main/persistence/db";
import { sql } from "drizzle-orm";
import { SaveLlmConfigCommandHandler } from "@/main/modules/llm-integration/application/commands/save-llm-config.command";
import { GetLlmConfigQueryHandler } from "@/main/modules/llm-integration/application/queries/get-llm-config.query";

describe("LLM Config Update Operations", () => {
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

  const createAndAssertLlmConfig = async (payload: {
    provider: string;
    model: string;
    apiKey: string;
    temperature: number;
    maxTokens: number;
  }): Promise<LlmConfig> => {
    const command = new SaveLlmConfigCommand(payload);
    return await cqrsDispatcher.dispatchCommand<SaveLlmConfigCommand, LlmConfig>(command);
  };

  const updateAndAssertLlmConfig = async (payload: {
    id: string;
    provider: string;
    model: string;
    apiKey: string;
    temperature: number;
    maxTokens: number;
  }, expectedTemperature: number, expectedApiKey: string): Promise<LlmConfig> => {
    const command = new SaveLlmConfigCommand(payload);
    const updatedConfig = await cqrsDispatcher.dispatchCommand<SaveLlmConfigCommand, LlmConfig>(command);
    expect(updatedConfig.apiKey).toBe(expectedApiKey);
    expect(updatedConfig.temperature).toBe(expectedTemperature);
    return updatedConfig;
  };

  it("should update an existing LLM config", async () => {
    const createdConfig = await createAndAssertLlmConfig({
      provider: "openai",
      model: "gpt-3.5-turbo",
      apiKey: "sk-old-key",
      temperature: 0.7,
      maxTokens: 1000,
    });

    const configId = createdConfig.id;
    await updateAndAssertLlmConfig({
      id: configId,
      provider: "openai",
      model: "gpt-3.5-turbo",
      apiKey: "sk-new-key",
      temperature: 0.8,
      maxTokens: 2000,
    }, 0.8, "sk-new-key");

    const retrievedConfig = await cqrsDispatcher.dispatchQuery<GetLlmConfigQuery, LlmConfig>(new GetLlmConfigQuery({ id: configId }));
    expect(retrievedConfig?.apiKey).toBe("sk-new-key");
  });
});