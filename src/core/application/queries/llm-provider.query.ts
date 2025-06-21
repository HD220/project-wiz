import { Executable } from "@/core/common/executable";
import { error, ok, Result } from "@/shared/result";
import { ILLMProviderRepository } from "@/core/ports/repositories/llm-provider.interface";

export class LLMProviderQuery
  implements Executable<LLMProviderQueryInput, LLMProviderQueryOutput>
{
  constructor(private readonly llmProviderRepository: ILLMProviderRepository) {}

  async execute(
    _: LLMProviderQueryInput
  ): Promise<Result<LLMProviderQueryOutput>> {
    try {
      const llmProviders = await this.llmProviderRepository.list();

      return ok(
        llmProviders.map((llmProvider) => ({
          id: llmProvider.id.value,
          name: llmProvider.name.value,
          slug: llmProvider.slug.value,
          models: llmProvider.models.map((model) => ({
            id: model.id.value,
            name: model.name.value,
            slug: model.slug.value,
          })),
        }))
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      return error(errorMessage);
    }
  }
}

export type LLMProviderQueryInput = undefined;
export type LLMProviderQueryOutput = {
  id: string | number;
  name: string;
  models: {
    id: string | number;
    name: string;
    slug: string;
  }[];
}[];
