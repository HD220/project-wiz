import { PromptTask } from '../entities/PromptTask';

export interface PromptQueueRepositoryPort {
  salvarPrompt(prompt: PromptTask): Promise<void>;
  atualizarPrompt(prompt: PromptTask): Promise<void>;
  removerPrompt(id: string): Promise<void>;
  buscarPromptPorId(id: string): Promise<PromptTask | null>;
  listarFila(): Promise<PromptTask[]>;
  persistirFila(fila: PromptTask[]): Promise<void>;
}