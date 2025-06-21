import { IQueueRepository } from "../../ports/repositories/iqueue-repository.interface";
import { IProcessor } from "../../ports/queue/iprocessor.interface";
import { Job } from "../entities/jobs/job.entity";
import { Result } from "../../../shared/result";
import { ILogger } from "../../ports/logger/ilogger.interface";

/**
 * Serviço responsável por orquestrar o processamento de jobs em background
 * @template Input - Tipo de entrada do processador
 * @template Output - Tipo de saída do processador
 * @template Q - Tipo da entidade Queue
 * @template J - Tipo da entidade Job (padrão: Job)
 */
export class WorkerService<Input, Output, Q, J extends Job = Job> {
  private isRunning = false;
  private currentJobs = new Set<string>();

  /**
   * @param queueRepository - Repositório para acesso à fila de jobs
   * @param processor - Processador para executar a lógica dos jobs
   * @param options - Opções de configuração do worker
   */
  private readonly options: {
    pollInterval: number;
    maxRetries: number;
  };

  constructor(
    private readonly queueRepository: IQueueRepository<Q, J>,
    private readonly processor: IProcessor<Input, Output>,
    private readonly logger: ILogger,
    options: {
      pollInterval?: number;
      maxRetries?: number;
    } = {}
  ) {
    this.options = {
      pollInterval: options.pollInterval ?? 1000,
      maxRetries: options.maxRetries ?? 3,
    };
  }

  /**
   * Inicia o worker para processar jobs continuamente
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.logger.info("WorkerService started", {
      pollInterval: this.options.pollInterval,
      maxRetries: this.options.maxRetries,
    });

    while (this.isRunning) {
      try {
        await this.processNextJob();
      } catch (error) {
        console.error("Error in worker loop:", error);
      }

      // Intervalo entre verificações de novos jobs
      await new Promise((resolve) =>
        setTimeout(resolve, this.options.pollInterval)
      );
    }
  }

  /**
   * Para o worker graciosamente
   */
  stop(): void {
    this.isRunning = false;
    this.logger.info("WorkerService stopping...", {
      activeJobs: this.currentJobs.size,
    });
  }

  /**
   * Processa o próximo job disponível na fila
   */
  private async processNextJob(): Promise<void> {
    // O repositório já retorna o job com maior prioridade
    const jobResult = await this.queueRepository.getNextJob();
    if (!jobResult.success) {
      this.logger.error("Failed to get next job", {
        error: jobResult.error,
      });
      return;
    }

    if (!jobResult.data || !this.isRunning) {
      return;
    }

    const job = jobResult.data;
    if (this.currentJobs.has(job.getId())) {
      return; // Evita processamento duplicado
    }

    this.currentJobs.add(job.getId());
    try {
      await this.processJob(job);
    } finally {
      this.currentJobs.delete(job.getId());
    }
  }

  /**
   * Processa um job individual com tratamento de erros e retry
   * @param job - Job a ser processado
   */
  private async processJob(job: J): Promise<void> {
    let retryCount = 0;
    let lastError: Error | null = null;

    // Marca o job como iniciado
    await this.queueRepository.markJobAsStarted(job.getId());

    while (retryCount < this.options.maxRetries && this.isRunning) {
      try {
        const input = job as unknown as Input; // Conversão segura já que Job é genérico
        const result = await this.processor.process(job, input);

        await this.queueRepository.markJobAsCompleted(job.getId(), result);
        return;
      } catch (error) {
        lastError = error as Error;
        retryCount++;
        this.logger.error(
          `Error processing job (attempt ${retryCount}/${this.options.maxRetries})`,
          {
            jobId: job.getId(),
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            attempt: retryCount,
            maxAttempts: this.options.maxRetries,
          }
        );

        if (retryCount < this.options.maxRetries) {
          const delayUntil = new Date(
            Date.now() + this.calculateRetryDelay(retryCount)
          );
          await this.queueRepository.markJobAsDelayed(job.getId(), delayUntil);
          await new Promise((resolve) =>
            setTimeout(resolve, this.calculateRetryDelay(retryCount))
          );
        }
      }
    }

    if (lastError) {
      await this.queueRepository.markJobAsFailed(job.getId(), lastError);
    }
  }

  /**
   * Calcula o delay exponencial para retry
   * @param retryCount - Número atual de tentativas
   * @returns Tempo de espera em milissegundos
   */
  private calculateRetryDelay(retryCount: number): number {
    return Math.min(1000 * 2 ** retryCount, 30000); // Exponencial com limite de 30s
  }
}
