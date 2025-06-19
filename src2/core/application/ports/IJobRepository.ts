import type { Job, NewJob } from '../../domain/schemas';

export interface IJobRepository {
  add(jobData: NewJob): Promise<Job>;
  findById(id: string): Promise<Job | null>;
  // Critérios podem incluir personaId, status específicos, etc. para flexibilidade futura
  // O método findNextPending agora é mais complexo devido a dependências e delays,
  // então a lógica principal de "qual é o próximo?" pode residir mais no QueueService.
  // O repositório pode oferecer métodos de busca mais genéricos.
  findPendingJobs(criteria?: {
    personaId?: string;
    excludedIds?: string[];
    limit?: number;
  }): Promise<Job[]>;

  findJobsByIds(ids: string[]): Promise<Job[]>; // Para checar dependências

  update(jobId: string, data: Partial<Omit<Job, 'id' | 'created_at'>>): Promise<Job | null>;
  // Adicionar outros métodos conforme necessário (ex: delete, findByStatus, etc.)
  // Exemplo:
  // findByStatus(status: Job['status'], personaId?: string): Promise<Job[]>;
}
