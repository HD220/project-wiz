import { fork, ChildProcess } from "child_process";
import { IWorkerPool } from "../../core/application/ports/worker-pool.interface";
import { Job } from "../../core/domain/entities/job/job.entity";
import { JobQueue } from "../../core/application/ports/job-queue.interface";
import { WorkerJobService } from "../../core/application/ports/worker-job-service.interface";
import path from "path";

export class ChildProcessWorkerPoolService implements IWorkerPool {
  private workers: ChildProcess[] = [];
  private availableWorkers: ChildProcess[] = [];
  private jobQueue: JobQueue;
  private workerJobService: WorkerJobService; // Embora o worker seja simples, a instrução pedia para receber

  private readonly numWorkers: number = 2; // Número fixo de workers por enquanto

  constructor(jobQueue: JobQueue, workerJobService: WorkerJobService) {
    this.jobQueue = jobQueue;
    this.workerJobService = workerJobService;
  }

  async start(): Promise<void> {
    const workerScriptPath = path.resolve(
      __dirname,
      "../workers/job-processor.worker.ts"
    );

    for (let i = 0; i < this.numWorkers; i++) {
      const worker = fork(workerScriptPath);

      worker.on(
        "message",
        (message: {
          type: string;
          jobId: string;
          status?: string;
          error?: string;
        }) => {
          if (message.type === "jobCompleted") {
            console.log(`Job ${message.jobId} concluída pelo worker.`);
            // Aqui você pode atualizar o status da job no banco de dados, etc.
            // this.jobQueue.updateJobStatus(message.jobId, message.status); // Exemplo
            this.availableWorkers.push(worker); // Torna o worker disponível novamente
          } else if (message.type === "jobFailed") {
            console.error(
              `Job ${message.jobId} falhou pelo worker: ${message.error}`
            );
            // Aqui você pode lidar com a falha da job, retentativas, etc.
            this.availableWorkers.push(worker); // Torna o worker disponível novamente
          }
        }
      );

      worker.on("exit", (code, signal) => {
        console.log(`Worker exited with code ${code} and signal ${signal}`);
        // Remover o worker da lista e talvez iniciar um novo
        this.workers = this.workers.filter((w) => w !== worker);
        this.availableWorkers = this.availableWorkers.filter(
          (w) => w !== worker
        );
        // Opcional: relançar worker se necessário
      });

      worker.on("error", (err) => {
        console.error(`Worker error: ${err.message}`);
      });

      this.workers.push(worker);
      this.availableWorkers.push(worker);
    }
    console.log(`Worker pool iniciado com ${this.numWorkers} workers.`);
  }

  async stop(): Promise<void> {
    for (const worker of this.workers) {
      worker.kill(); // Envia um sinal SIGTERM para o worker
    }
    this.workers = [];
    this.availableWorkers = [];
    console.log("Worker pool parado.");
  }

  async processJob(job: Job): Promise<void> {
    if (this.availableWorkers.length > 0) {
      const worker = this.availableWorkers.shift(); // Pega um worker disponível
      if (worker) {
        worker.send({ type: "processJob", job });
      } else {
        // Isso não deveria acontecer se a verificação acima for verdadeira, mas para segurança
        console.warn(
          "Nenhum worker disponível, job será re-enfileirada ou aguardará."
        );
        // Aqui você pode implementar uma fila interna ou re-enfileirar a job
        // await this.jobQueue.enqueue(job); // Exemplo
      }
    } else {
      console.warn(
        "Nenhum worker disponível, job será re-enfileirada ou aguardará."
      );
      // Aqui você pode implementar uma fila interna ou re-enfileirar a job
      // await this.jobQueue.enqueue(job); // Exemplo
    }
  }
}
