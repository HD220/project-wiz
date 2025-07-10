import { IQuery } from "@/main/kernel/cqrs-dispatcher";
import { LlmConfig } from "@/main/modules/llm-integration/domain/llm-config.entity";
import { ILlmConfigRepository } from "@/main/modules/llm-integration/domain/llm-config.repository";

export interface IGetLlmConfigQueryPayload {
  id?: string;
  provider?: string;
  model?: string;
}

export class GetLlmConfigQuery implements IQuery<IGetLlmConfigQueryPayload> {
  readonly type = "GetLlmConfigQuery";
  constructor(public payload: IGetLlmConfigQueryPayload) {}
}

export class GetLlmConfigQueryHandler {
  constructor(private llmConfigRepository: ILlmConfigRepository) {}

  async handle(query: GetLlmConfigQuery): Promise<LlmConfig | undefined> {
    try {
      if (query.payload.id) {
        return await this.llmConfigRepository.findById(query.payload.id);
      }
      if (query.payload.provider && query.payload.model) {
        return await this.llmConfigRepository.findByProviderAndModel(
          query.payload.provider,
          query.payload.model,
        );
      }
      throw new Error("Either id or provider and model must be provided.");
    } catch (error) {
      console.error(`Failed to get LLM config:`, error);
      throw new Error(`Failed to get LLM config: ${(error as Error).message}`);
    }
  }
}
