import { PromptStatus } from './PromptStatus';

export interface PromptTask {
  id: string;
  conteudo: string;
  prioridade: number;
  status: PromptStatus;
  createdAt: Date;
  startedAt?: Date;
  finishedAt?: Date;
  sessaoId?: string;
  metadados?: Record<string, any>;
}