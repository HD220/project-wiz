import { PromptRepository } from '../domain/PromptRepository';
import { Prompt } from '../domain/Prompt';

export class PromptRepositoryImpl implements PromptRepository {
  private prompts: Prompt[] = [];

  async save(prompt: Prompt): Promise<void> {
    if (!prompt.id || !prompt.content || !prompt.createdAt) {
      throw new Error('Invalid prompt data');
    }
    this.prompts.push(prompt);
  }

  async findById(id: string): Promise<Prompt | null> {
    return this.prompts.find(prompt => prompt.id === id) || null;
  }

  async findAll(): Promise<Prompt[]> {
    return this.prompts;
  }

  async delete(id: string): Promise<void> {
    this.prompts = this.prompts.filter(prompt => prompt.id !== id);
  }
}