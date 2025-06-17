import { Worker as WorkerInterface } from "../../../ports/repositories/worker.interface";
import { Job } from "../job";
import { Queue } from "../queue";
import { sleep } from "../../../common/utils";

export class Worker implements WorkerInterface {
  private _isRunning = false;
  private currentJob: Job | null = null;
  private queue: Queue;
  private processingFn?: (job: Job) => Promise<void>;
  private pollingIntervalMs: number;
  private agentId?: string;

  constructor(queue: Queue) {
    this.queue = queue;
    this.pollingIntervalMs = 5000; // Default 5 segundos
  }

  async start(
    agentId: string,
    processingFn: (job: Job) => Promise<void>,
    options: { pollingIntervalMs?: number } = {}
  ): Promise<void> {
    if (this.isRunning()) {
      throw new Error("Worker já está em execução");
    }

    this._isRunning = true;
    this.processingFn = processingFn;
    this.agentId = agentId;
    this.pollingIntervalMs =
      options.pollingIntervalMs ?? this.pollingIntervalMs;

    console.log(
      `Worker iniciado para agente ${agentId} com intervalo de ${this.pollingIntervalMs}ms`
    );

    while (this._isRunning) {
      try {
        this.currentJob = await this.queue.getNextJob(agentId);

        if (this.currentJob) {
          await this.processJob(this.currentJob);
        } else {
          await sleep(this.pollingIntervalMs);
        }
      } catch (error) {
        console.error("Erro no worker:", error);
        await sleep(this.pollingIntervalMs);
      }
    }
  }

  async stop(): Promise<void> {
    if (this.currentJob) {
      console.warn(
        `Parando worker com job ${this.currentJob.id} em processamento`
      );
    }
    this._isRunning = false;
    console.log(`Worker parado para agente ${this.agentId}`);
  }

  isRunning(): boolean {
    return this._isRunning;
  }

  private async processJob(job: Job): Promise<void> {
    try {
      await this.processingFn!(job);
      console.log(`Job ${job.id} concluída com sucesso`);
      await this.queue.jobFinished(job.id.toString(), undefined);
    } catch (error) {
      console.error(`Falha na execução da job ${job.id}:`, error);
      await this.queue.jobFailed(
        job.id.toString(),
        error instanceof Error ? error.message : String(error)
      );
    } finally {
      this.currentJob = null;
    }
  }
}
