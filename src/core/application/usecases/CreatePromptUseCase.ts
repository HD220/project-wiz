import type { PromptRepositoryPort, Prompt } from '../ports/PromptRepositoryPort';
import type { PromptValidationConfig, PromptPolicyService } from '../services/prompt-policy-service';

export class CreatePromptUseCase {
  constructor(
    private readonly promptRepository: PromptRepositoryPort,
    private readonly promptPolicyService: PromptPolicyService,
  ) {}

  async execute(promptData: Prompt, config: PromptValidationConfig): Promise<void> {
    const existingPrompts = await this.promptRepository.getAllPrompts();

    this.promptPolicyService.validateCreatePrompt(promptData, config, existingPrompts);

    await this.promptRepository.savePrompt(promptData);
  }
}