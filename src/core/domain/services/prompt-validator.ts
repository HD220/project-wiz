import type { PromptData, PromptValidationConfig } from '../contracts/prompt-data';

export class PromptValidator {
  static validateCreatePrompt(
    data: PromptData,
    config: PromptValidationConfig,
    existingPromptNames: string[],
    totalPromptsCount: number
  ) {
    if (data.name.length < 3 || data.name.length > 50) {
      throw new Error("Prompt name must be between 3 and 50 characters.");
    }

    if (existingPromptNames.includes(data.name)) {
      throw new Error("A prompt with this name already exists.");
    }

    if (totalPromptsCount >= config.maxPrompts) {
      throw new Error(`Maximum limit of ${config.maxPrompts} prompts reached.`);
    }

    if (data.content.length > config.maxContentLength) {
      throw new Error(`Prompt content exceeds the limit of ${config.maxContentLength} characters.`);
    }

    if (data.variables.length > config.maxVariables) {
      throw new Error(`Maximum number of variables per prompt is ${config.maxVariables}.`);
    }

    const contentLower = data.content.toLowerCase();
    for (const word of config.forbiddenWords) {
      if (contentLower.includes(word.toLowerCase())) {
        throw new Error(`Prompt content contains a forbidden word: "${word}".`);
      }
    }
  }

  static validateUpdatePrompt(
    data: Partial<PromptData>,
    config: PromptValidationConfig,
    existingPromptNames: string[],
    currentPrompt: PromptData
  ) {
    if (data.name) {
      if (data.name.length < 3 || data.name.length > 50) {
        throw new Error("Prompt name must be between 3 and 50 characters.");
      }

      if (data.name !== currentPrompt.name && existingPromptNames.includes(data.name)) {
        throw new Error("A prompt with this name already exists.");
      }
    }

    if (data.content && data.content.length > config.maxContentLength) {
      throw new Error(`Prompt content exceeds the limit of ${config.maxContentLength} characters.`);
    }

    if (data.variables && data.variables.length > config.maxVariables) {
      throw new Error(`Maximum number of variables per prompt is ${config.maxVariables}.`);
    }

    if (data.content) {
      const contentLower = data.content.toLowerCase();
      for (const word of config.forbiddenWords) {
        if (contentLower.includes(word.toLowerCase())) {
          throw new Error(`Prompt content contains a forbidden word: "${word}".`);
        }
      }
    }
  }
}