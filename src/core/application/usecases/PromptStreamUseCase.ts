import type { Prompt } from '../ports/PromptRepositoryPort';
import type { StreamChunk, LLMServicePort } from '../ports/LLMServicePort';

export class PromptStreamUseCase {
  constructor(
    private readonly llmService: LLMServicePort,
  ) {}

  async execute(
    prompt: Prompt,
    onChunk: (chunk: StreamChunk) => void
  ): Promise<void> {
    await this.llmService.promptStream(prompt, onChunk);
  }
}