// src/core/application/ports/job-queue.interface.ts
import { Result } from '@/shared/result';
import { Job } from '@/core/domain/entities/job/job.entity';
import { JobId } from '@/core/domain/entities/job/value-objects'; // Assuming index export from VO folder

export interface IJobQueue {
    /** Adiciona um job à fila. Se o job já existir (mesmo ID), pode ser atualizado. */
    addJob(job: Job): Promise<Result<void>>;

    /** Obtém o próximo job da fila pronto para execução.
     *  Considera prioridade, status (PENDING), dependências resolvidas, e runAt (para DELAYED).
     *  Pode marcar o job como "dequeued" ou "claimed" para evitar processamento duplicado.
     */
    getNextJob(): Promise<Result<Job | null>>;

    /** Confirma que um job foi concluído com sucesso. */
    // Esta funcionalidade é provavelmente melhor tratada pelo ProcessJobService salvando o Job com status FINISHED.
    // A fila em si pode não precisar de um método 'completeJob' explícito se o status do Job no DB for a fonte da verdade.
    // No entanto, pode ser útil para limpar locks ou contadores na fila.
    // completeJob(jobId: JobId): Promise<Result<void>>;

    /** Marca um job como falho na fila (se a fila mantiver estado além do JobRepository). */
    // Similar a completeJob, pode ser gerenciado pelo status do Job.
    // failJob(jobId: JobId, errorDetails: string): Promise<Result<void>>;

    /** Remove um job da fila (e.g., se cancelado). */
    removeJob(jobId: JobId): Promise<Result<void>>;
}
