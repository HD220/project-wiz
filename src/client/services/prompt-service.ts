import { IPromptRepository, PromptData } from "../types/prompt-repository";

export class PromptService {
  private repository: IPromptRepository;

  constructor(repository: IPromptRepository) {
    this.repository = repository;
  }

  async listPrompts(): Promise<PromptData[]> {
    return this.repository.listPrompts();
  }

  async createPrompt(prompt: PromptData): Promise<void> {
    return this.repository.createPrompt(prompt);
  }

  async updatePrompt(id: string, updates: Partial<PromptData>): Promise<void> {
    return this.repository.updatePrompt(id, updates);
  }

  async deletePrompt(id: string): Promise<void> {
    return this.repository.deletePrompt(id);
  }

  async restoreDefaultPrompts(): Promise<void> {
    return this.repository.restoreDefaultPrompts();
  }
}