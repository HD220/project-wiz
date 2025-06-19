import type { Job, NewJob } from '../../domain/schemas';

export interface IQueueService {
  addJob(jobData: NewJob): Promise<Job>;
  // getNextJob agora pode ter uma lógica mais sofisticada para determinar o "próximo"
  // considerando dependências, delays, prioridades dinâmicas, etc.
  getNextJob(criteria?: {
    personaId?: string; // Agente específico buscando seus jobs
    // Outros critérios como capabilities da persona poderiam ser adicionados
  }): Promise<Job | null>;
  completeJob(jobId: string, result: Job['result']): Promise<Job | null>;
  failJob(jobId: string, reason: string): Promise<Job | null>;
  updateJobStatus(jobId: string, status: Job['status']): Promise<Job | null>; // Genérico para mudar status
  updateJobData(jobId: string, data: Job['data']): Promise<Job | null>; // Para atualizar ActivityContext
  // delayJob foi removido, pois failJob já lida com delays de retentativa.
  // Agendamento explícito pode ser um tipo de Job ou um atributo na criação.
}
