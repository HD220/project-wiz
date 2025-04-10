import type { PromptRepositoryPort, Prompt } from '../ports/PromptRepositoryPort';
import type { PromptValidationConfig, PromptPolicyService } from '../services/prompt-policy-service';

export class UpdatePromptUseCase {
  constructor(
    private readonly promptRepository: PromptRepositoryPort,
    private readonly promptPolicyService: PromptPolicyService,
  ) {}

  async execute(
    id: string,
    promptData: Partial<Prompt>,
    config: PromptValidationConfig
  ): Promise<void> {
    const existingPrompt = await this.promptRepository.getPromptById(id);
    if (!existingPrompt) {
      throw new Error('Prompt não encontrado.');
    }

    const existingPrompts = await this.promptRepository.getAllPrompts();

    this.promptPolicyService.validateUpdatePrompt(
      promptData,
      config,
      existingPrompts,
      existingPrompt
    );

    await this.promptRepository.updatePrompt(id, { ...existingPrompt, ...promptData });
  }
}