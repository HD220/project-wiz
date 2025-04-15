import { Prompt } from './Prompt';

export interface PromptRepository {
  save(prompt: Prompt): Promise<void>;
  findById(id: string): Promise<Prompt | null>;
  findAll(): Promise<Prompt[]>;
  delete(id: string): Promise<void>;
}