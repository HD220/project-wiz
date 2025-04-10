import { PromptTask } from '../entities/PromptTask';

export interface LLMServicePort {
  enviarPrompt(prompt: PromptTask): Promise<any>;
  cancelarPrompt(promptId: string): Promise<void>;
}