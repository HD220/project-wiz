import { Executable } from "@/core/common/executable";
import { NOK, OK, Result } from "@/core/common/result";
import { ILLMProviderRepository } from "@/core/ports/repositories/llm-provider.repository";

export class LLMProviderQuery implements Executable<Input, Output> {
  constructor(private readonly llmProviderRepository: ILLMProviderRepository) {}

  async execute(): Promise<Result<Output>> {
    try {
      const llmProviders = await this.llmProviderRepository.list();

      return OK(
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
    } catch (error) {
      return NOK(error as Error);
    }
  }
}

type Input = undefined;
type Output = {
  id: string | number;
  name: string;
  models: {
    id: string | number;
    name: string;
    slug: string;
  }[];
}[];
