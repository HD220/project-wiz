import { PromptTask } from '../entities/PromptTask';

export interface PromptQueueServicePort {
  enfileirarPrompt(prompt: PromptTask): Promise<void>;
  priorizarPrompt(id: string, prioridade: number): Promise<void>;
  pausarPrompt(id: string): Promise<void>;
  retomarPrompt(id: string): Promise<void>;
  cancelarPrompt(id: string): Promise<void>;
  reordenarPrompt(id: string, novaPosicao: number): Promise<void>;
  listarFila(): Promise<PromptTask[]>;
}