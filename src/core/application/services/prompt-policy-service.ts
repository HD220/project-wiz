import { Prompt } from '../ports/PromptRepositoryPort';

export interface PromptValidationConfig {
  maxPrompts: number;
  maxContentLength: number;
  maxVariables: number;
  forbiddenWords: string[];
}

export class PromptPolicyService {
  validateCreatePrompt(
    promptData: Prompt,
    config: PromptValidationConfig,
    existingPrompts: Prompt[],
  ): void {
    this.validatePromptContent(promptData, config);
    this.validatePromptCount(existingPrompts.length, config.maxPrompts);
    this.validatePromptNameUniqueness(promptData, existingPrompts);
  }

  validateUpdatePrompt(
    promptData: Partial<Prompt>,
    config: PromptValidationConfig,
    existingPrompts: Prompt[],
    existingPrompt: Prompt
  ): void {
    this.validatePromptContent({ ...existingPrompt, ...promptData }, config);
    this.validatePromptNameUniqueness({ ...existingPrompt, ...promptData }, existingPrompts);
  }

  private validatePromptContent(prompt: Prompt, config: PromptValidationConfig): void {
    if (prompt.text.length > config.maxContentLength) {
      throw new Error(`O conteúdo do prompt excede o limite de ${config.maxContentLength} caracteres.`);
    }

    const variableCount = prompt.parameters ? Object.keys(prompt.parameters).length : 0;
    if (variableCount > config.maxVariables) {
      throw new Error(`Número máximo de variáveis (${config.maxVariables}) excedido.`);
    }

    for (const word of config.forbiddenWords) {
      if (prompt.text.includes(word)) {
        throw new Error(`O prompt contém uma palavra proibida: ${word}`);
      }
    }
  }

  private validatePromptCount(currentCount: number, maxPrompts: number): void {
    if (currentCount >= maxPrompts) {
      throw new Error(`Número máximo de prompts (${maxPrompts}) atingido.`);
    }
  }

  private validatePromptNameUniqueness(prompt: Prompt, existingPrompts: Prompt[]): void {
    const promptName = (prompt as any)['name'];
    if (!promptName) return;
    const exists = existingPrompts.some(p => (p as any)['name'] === promptName);
    if (exists) {
      throw new Error(`Já existe um prompt com o nome '${promptName}'.`);
    }
  }
}