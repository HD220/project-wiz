import { SettingsService } from "./settings-service";
import { PromptRepository } from "../../infrastructure/db/promptRepository";
import { PromptValidator, PromptValidationConfig, PromptData } from "../../domain/entities/prompt-validator";

export class PromptService {
  static async createPrompt(data: PromptData) {
    const [
      maxPrompts,
      maxContentLength,
      maxVariables,
      forbiddenWords,
    ] = await Promise.all([
      SettingsService.getMaxPromptsPerUser(),
      SettingsService.getMaxPromptContentLength(),
      SettingsService.getMaxVariablesPerPrompt(),
      SettingsService.getForbiddenWords(),
    ]);

    const config: PromptValidationConfig = {
      maxPrompts,
      maxContentLength,
      maxVariables,
      forbiddenWords,
    };

    const existingPrompts = await PromptRepository.listPromptNames();
    const totalPromptsCount = existingPrompts.length;

    PromptValidator.validateCreatePrompt(data, config, existingPrompts, totalPromptsCount);

    return PromptRepository.createPrompt(data);
  }

  static async updatePrompt(id: string, updatedData: Partial<PromptData>) {
    const [
      maxContentLength,
      maxVariables,
      forbiddenWords,
    ] = await Promise.all([
      SettingsService.getMaxPromptContentLength(),
      SettingsService.getMaxVariablesPerPrompt(),
      SettingsService.getForbiddenWords(),
    ]);

    const config: PromptValidationConfig = {
      maxPrompts: 0,
      maxContentLength,
      maxVariables,
      forbiddenWords,
    };

    const existingPrompt = await PromptRepository.getPromptById(id);
    if (!existingPrompt) {
      throw new Error("Prompt não encontrado.");
    }

    const existingPrompts = await PromptRepository.listPromptNamesExceptId(id);

    PromptValidator.validateUpdatePrompt(updatedData, config, existingPrompts, existingPrompt);

    return PromptRepository.updatePrompt(id, updatedData);
  }
}