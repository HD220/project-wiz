import { IQuery } from "@/main/kernel/cqrs-dispatcher";
import { ApplicationError } from "@/main/errors/application.error";
import { LlmConfig } from "@/main/modules/llm-integration/domain/llm-config.entity";
import { ILlmConfigRepository } from "@/main/modules/llm-integration/domain/llm-config.repository";

export type ListLlmConfigsQueryPayload = Record<string, never>;

export class ListLlmConfigsQuery implements IQuery<ListLlmConfigsQueryPayload> {
  readonly type = "ListLlmConfigsQuery";
  constructor(public payload: ListLlmConfigsQueryPayload = {}) {}
}

export class ListLlmConfigsQueryHandler {
  constructor(private llmConfigRepository: ILlmConfigRepository) {}

  async handle(_query: ListLlmConfigsQuery): Promise<LlmConfig[]> {
    try {
      return await this.llmConfigRepository.findAll();
    } catch (error) {
      console.error(`Failed to list LLM configs:`, error);
      throw new ApplicationError(
        `Failed to list LLM configs: ${(error as Error).message}`,
      );
    }
  }
}
