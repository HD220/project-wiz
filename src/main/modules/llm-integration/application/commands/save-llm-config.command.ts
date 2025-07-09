import { ICommand } from "@/main/kernel/cqrs-dispatcher";
import { LlmConfig } from "@/main/modules/llm-integration/domain/llm-config.entity";
import { ILlmConfigRepository } from "@/main/modules/llm-integration/domain/llm-config.repository";

export interface SaveLlmConfigCommandPayload {
  id?: string;
  provider: string;
  model: string;
  apiKey: string;
  temperature: number;
  maxTokens: number;
}

export class SaveLlmConfigCommand implements ICommand<SaveLlmConfigCommandPayload> {
  readonly type = "SaveLlmConfigCommand";
  constructor(public payload: SaveLlmConfigCommandPayload) {}
}

export class SaveLlmConfigCommandHandler {
  constructor(private llmConfigRepository: ILlmConfigRepository) {}

  async handle(command: SaveLlmConfigCommand): Promise<LlmConfig> {
    let llmConfig: LlmConfig;

    try {
      if (command.payload.id) {
        const existingConfig = await this.llmConfigRepository.findById(command.payload.id);
        if (existingConfig) {
          llmConfig = existingConfig;
          llmConfig.updateConfig({
            provider: command.payload.provider,
            model: command.payload.model,
            apiKey: command.payload.apiKey,
            temperature: command.payload.temperature,
            maxTokens: command.payload.maxTokens,
          });
        } else {
          // If ID is provided but not found, create a new one with that ID
          llmConfig = new LlmConfig({
            provider: command.payload.provider,
            model: command.payload.model,
            apiKey: command.payload.apiKey,
            temperature: command.payload.temperature,
            maxTokens: command.payload.maxTokens,
          }, command.payload.id);
        }
      } else {
        llmConfig = new LlmConfig({
          provider: command.payload.provider,
          model: command.payload.model,
          apiKey: command.payload.apiKey,
          temperature: command.payload.temperature,
          maxTokens: command.payload.maxTokens,
        });
      }

      return await this.llmConfigRepository.save(llmConfig);
    } catch (error) {
      console.error(`Failed to save LLM config:`, error);
      throw new Error(`Failed to save LLM config: ${(error as Error).message}`);
    }
  }
}
