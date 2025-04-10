import { PromptRepositoryPort, Prompt } from '../ports/PromptRepositoryPort';
import { SettingsService } from './settings-service';
import { PromptPolicyService, PromptValidationConfig } from './prompt-policy-service';

export class PromptService {
  constructor(
    private readonly promptRepository: PromptRepositoryPort,
    private readonly settingsService: SettingsService,
    private readonly promptPolicyService: PromptPolicyService
  ) {}

  async createPrompt(promptData: Prompt): Promise<void> {
    const config = await this.loadValidationConfig();

    const existingPrompts = await this.promptRepository.getAllPrompts();

    this.promptPolicyService.validateCreatePrompt(
      promptData,
      config,
      existingPrompts
    );

    await this.promptRepository.savePrompt(promptData);
  }

  async updatePrompt(
    id: string,
    updatedData: Partial<Prompt>
  ): Promise<void> {
    const config = await this.loadValidationConfig();

    const existingPrompt = await this.promptRepository.getPromptById(id);
    if (!existingPrompt) {
      throw new Error('Prompt não encontrado.');
    }

    const existingPrompts = (await this.promptRepository.getAllPrompts()).filter(
      (p) => (p as any)['id'] !== id
    );

    this.promptPolicyService.validateUpdatePrompt(
      updatedData,
      config,
      existingPrompts,
      existingPrompt
    );

    const updatedPrompt = { ...existingPrompt, ...updatedData };
    await this.promptRepository.updatePrompt(id, updatedPrompt);
  }

  private async loadValidationConfig(): Promise<PromptValidationConfig> {
    const [
      maxPrompts,
      maxContentLength,
      maxVariables,
      forbiddenWords,
    ] = await Promise.all([
      this.settingsService.getMaxPromptsPerUser(),
      this.settingsService.getMaxPromptContentLength(),
      this.settingsService.getMaxVariablesPerPrompt(),
      this.settingsService.getForbiddenWords(),
    ]);

    return {
      maxPrompts,
      maxContentLength,
      maxVariables,
      forbiddenWords,
    };
  }
}