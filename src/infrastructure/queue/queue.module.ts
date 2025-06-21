import { WorkerService } from "@/core/domain/services/worker.service";
import { IQueueRepository } from "@/core/ports/repositories/iqueue-repository.interface";
import { DrizzleQueueRepository } from "@/infrastructure/repositories/drizzle/queue.repository";
import { IProcessor } from "@/core/ports/queue/iprocessor.interface";
import { Queue } from "@/core/domain/entities/queue/queue.entity";
import { Job } from "@/core/domain/entities/jobs/job.entity";
import { JsonLogger } from "@/infrastructure/services/logger/json-logger.service";

export class QueueModule {
  private queueRepository: IQueueRepository<Queue, Job>;
  private workerServices: Map<string, WorkerService<any, any, Queue, Job>>;

  constructor() {
    this.queueRepository = new DrizzleQueueRepository(new JsonLoggerService());
    this.workerServices = new Map();
  }

  /**
   * Inicializa o módulo de filas com processadores específicos
   * @param processors Mapa de processadores por nome de fila
   */
  public async initialize(
    processors: Map<string, IProcessor<any, any>>
  ): Promise<void> {
    for (const [queueName, processor] of processors) {
      const workerService = new WorkerService<any, any, Queue, Job>(
        this.queueRepository,
        processor,
        new JsonLogger(`WorkerService:${queueName}`),
        { pollInterval: 1000, maxRetries: 3 }
      );
      this.workerServices.set(queueName, workerService);
      await workerService.start();
    }
  }

  /**
   * Adiciona um job à fila especificada
   * @param queueName Nome da fila de destino
   * @param jobData Dados do job a ser adicionado
   * @returns Promise com o job criado
   */
  public async addJob(queueName: string, jobData: any): Promise<Job> {
    // Implementação básica para demonstração
    const job = {
      getId: () => jobData.id,
      getStatus: () => ({ current: jobData.status || "WAITING" }),
      getCreatedAt: () => new Date(),
      getUpdatedAt: () => new Date(),
      ...jobData,
    } as unknown as Job;

    const queue = {
      getId: () => queueName,
      getName: () => queueName,
      getCreatedAt: () => new Date(),
      getUpdatedAt: () => new Date(),
      jobs: [job],
    } as unknown as Queue;

    await this.queueRepository.create(queue);
    return job;
  }

  /**
   * Obtém o serviço de worker para uma fila específica
   * @param queueName Nome da fila
   * @returns Instância do WorkerService ou undefined se não encontrado
   */
  public getWorkerService(
    queueName: string
  ): WorkerService<any, any, Queue, Job> | undefined {
    return this.workerServices.get(queueName);
  }

  /**
   * Obtém o repositório de filas para operações diretas
   * @returns Instância do IQueueRepository
   */
  public getQueueRepository(): IQueueRepository<Queue, Job> {
    return this.queueRepository;
  }
}
