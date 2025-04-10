import type { PromptData, PromptValidationConfig } from '../contracts/prompt-data';

export class PromptValidator {
  static validateCreatePrompt(
    data: PromptData,
    config: PromptValidationConfig,
    existingPromptNames: string[],
    totalPromptsCount: number
  ) {
    if (data.name.length < 3 || data.name.length > 50) {
      throw new Error("O nome do prompt deve ter entre 3 e 50 caracteres.");
    }

    if (existingPromptNames.includes(data.name)) {
      throw new Error("Já existe um prompt com este nome.");
    }

    if (totalPromptsCount >= config.maxPrompts) {
      throw new Error(`Limite máximo de ${config.maxPrompts} prompts atingido.`);
    }

    if (data.content.length > config.maxContentLength) {
      throw new Error(`O conteúdo do prompt excede o limite de ${config.maxContentLength} caracteres.`);
    }

    if (data.variables.length > config.maxVariables) {
      throw new Error(`Número máximo de variáveis por prompt é ${config.maxVariables}.`);
    }

    const contentLower = data.content.toLowerCase();
    for (const word of config.forbiddenWords) {
      if (contentLower.includes(word.toLowerCase())) {
        throw new Error(`O conteúdo do prompt contém uma palavra proibida: "${word}".`);
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
        throw new Error("O nome do prompt deve ter entre 3 e 50 caracteres.");
      }

      if (data.name !== currentPrompt.name && existingPromptNames.includes(data.name)) {
        throw new Error("Já existe um prompt com este nome.");
      }
    }

    if (data.content && data.content.length > config.maxContentLength) {
      throw new Error(`O conteúdo do prompt excede o limite de ${config.maxContentLength} caracteres.`);
    }

    if (data.variables && data.variables.length > config.maxVariables) {
      throw new Error(`Número máximo de variáveis por prompt é ${config.maxVariables}.`);
    }

    if (data.content) {
      const contentLower = data.content.toLowerCase();
      for (const word of config.forbiddenWords) {
        if (contentLower.includes(word.toLowerCase())) {
          throw new Error(`O conteúdo do prompt contém uma palavra proibida: "${word}".`);
        }
      }
    }
  }
}