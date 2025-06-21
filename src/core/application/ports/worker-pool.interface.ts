import { Result } from '@/shared/result';
// Imports for WorkerId, Job, Worker might not be needed if methods are just start/shutdown
// import { WorkerId } from "../../domain/entities/worker/value-objects/worker-id.vo";
// import { Job } from "../../domain/entities/job/job.entity";
// import { Worker } from "../../domain/entities/worker/worker.entity";

export interface IWorkerPool {
  /** Inicializa o pool de workers. */
  start(): Promise<Result<void>>;

  /** Para o pool de workers e aguarda a conclusão dos jobs ativos (ou timeout). */
  shutdown(): Promise<Result<void>>; // Renamed from stop and added Result

  /** Submete um job para ser processado por um worker disponível no pool.
   *  Esta é uma alternativa a ter workers puxando jobs da IJobQueue diretamente.
   *  Se os workers puxam da IJobQueue, este método pode não ser necessário.
   *  A arquitetura mencionou "WorkerPool gerencia Workers para processamento concorrente".
   *  E "Worker obtém Jobs da Queue". Isso sugere que o WorkerPool não submete jobs,
   *  mas sim gerencia os workers que puxam da IJobQueue.
   *  Por enquanto, vamos manter start/shutdown.
   */
  // submitJob(jobId: JobId): Promise<Result<void>>; // Kept commented out as per prompt
}
