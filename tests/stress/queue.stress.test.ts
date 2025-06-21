import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { DrizzleQueueRepository } from "@/infrastructure/repositories/drizzle/queue.repository";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { eq } from "drizzle-orm";
import { queues } from "@/infrastructure/services/drizzle/schemas/queues";
import { jobs } from "@/infrastructure/services/drizzle/schemas/jobs";
import { Queue } from "@/core/domain/entities/queue/queue.entity";
import { Job } from "@/core/domain/entities/jobs/job.entity";
import {
  JobStatus,
  JobStatusType,
} from "@/core/domain/entities/jobs/job-status";
import { Result } from "@/shared/result";

// Implementação concreta para testes de estresse
class StressTestJob extends Job {
  constructor(
    id: string,
    public readonly name: string,
    public readonly payload: Record<string, unknown> = {},
    options: { priority?: number } = {}
  ) {
    super(id, new JobStatus("WAITING" as JobStatusType), options.priority);
  }

  async execute(): Promise<Result<any>> {
    // Simula um processamento rápido
    return { success: true, data: this.payload };
  }
}

describe("Queue Stress Tests", () => {
  let queueRepository: DrizzleQueueRepository;
  let sqlite: Database.Database;
  let db: ReturnType<typeof drizzle>;

  beforeEach(async () => {
    sqlite = new Database(":memory:");
    db = drizzle(sqlite, { schema: { queues, jobs } });
    await migrate(db, { migrationsFolder: "./migrations" });

    queueRepository = new DrizzleQueueRepository();
    (queueRepository as any).db = db;
  });

  afterEach(() => {
    sqlite.close();
  });

  describe("Massive Job Processing", () => {
    it("should handle 1000+ jobs simultaneously", async () => {
      const queue = new Queue("stress-queue", "Stress Test Queue");
      await queueRepository.create(queue);

      // Adiciona 1000 jobs
      const jobsCount = 1000;
      for (let i = 0; i < jobsCount; i++) {
        const job = new StressTestJob(`job-${i}`, `Job ${i}`, {
          index: i,
        }) as unknown as Job;
        queue.addJob(job);
      }

      // Medição de tempo
      const startTime = performance.now();
      await queueRepository.save(queue);
      const saveTime = performance.now() - startTime;

      console.log(`Saved ${jobsCount} jobs in ${saveTime}ms`);

      // Verifica se todos os jobs foram salvos
      const dbJobs = await db
        .select()
        .from(jobs)
        .where(eq(jobs.queueId, "stress-queue"));
      expect(dbJobs).toHaveLength(jobsCount);

      // Processa todos os jobs
      const processStart = performance.now();
      let processedCount = 0;
      while (processedCount < jobsCount) {
        const jobResult = await queueRepository.getNextJob();
        if (jobResult.success && jobResult.data) {
          await queueRepository.markJobAsCompleted(jobResult.data.getId(), {});
          processedCount++;
        }
      }
      const processTime = performance.now() - processStart;

      console.log(`Processed ${jobsCount} jobs in ${processTime}ms`);
      expect(processedCount).toBe(jobsCount);
    });
  });

  describe("Performance Benchmarks", () => {
    const testCases = [
      { size: "small", payloadSize: 1, jobsCount: 100 },
      { size: "medium", payloadSize: 10, jobsCount: 500 },
      { size: "large", payloadSize: 100, jobsCount: 1000 },
    ];

    for (const testCase of testCases) {
      it(`should benchmark with ${testCase.size} payload (${testCase.payloadSize}KB) and ${testCase.jobsCount} jobs`, async () => {
        const queue = new Queue(
          `benchmark-${testCase.size}-queue`,
          `Benchmark ${testCase.size} Queue`
        );
        await queueRepository.create(queue);

        // Cria payload com tamanho específico
        const payload = {
          data: "x".repeat(testCase.payloadSize * 1024),
          timestamp: Date.now(),
        };

        // Adiciona jobs
        for (let i = 0; i < testCase.jobsCount; i++) {
          const job = new StressTestJob(`job-${i}`, `Job ${i}`, payload);
          queue.addJob(job);
        }

        // Medição de tempo de salvamento
        const saveStart = performance.now();
        await queueRepository.save(queue);
        const saveTime = performance.now() - saveStart;

        // Medição de tempo de processamento
        const processStart = performance.now();
        let processedCount = 0;
        while (processedCount < testCase.jobsCount) {
          const jobResult = await queueRepository.getNextJob();
          if (jobResult.success && jobResult.data) {
            await queueRepository.markJobAsCompleted(
              jobResult.data.getId(),
              {}
            );
            processedCount++;
          }
        }
        const processTime = performance.now() - processStart;

        console.log(
          `Benchmark ${testCase.size}: Saved ${testCase.jobsCount} jobs (${testCase.payloadSize}KB) in ${saveTime}ms, Processed in ${processTime}ms`
        );

        expect(processedCount).toBe(testCase.jobsCount);
      });
    }
  });

  describe("Concurrency Levels", () => {
    const concurrencyLevels = [1, 5, 10, 20];
    const jobsCount = 1000;

    for (const level of concurrencyLevels) {
      it(`should benchmark with ${level} concurrent workers`, async () => {
        const queue = new Queue(
          `concurrency-${level}-queue`,
          `Concurrency ${level} Queue`
        );
        await queueRepository.create(queue);

        // Adiciona jobs
        for (let i = 0; i < jobsCount; i++) {
          const job = new StressTestJob(`job-${i}`, `Job ${i}`);
          queue.addJob(job);
        }
        await queueRepository.save(queue);

        // Simula workers concorrentes
        const worker = async (workerId: number) => {
          let processed = 0;
          while (processed < jobsCount / level) {
            const jobResult = await queueRepository.getNextJob();
            if (jobResult.success && jobResult.data) {
              await queueRepository.markJobAsCompleted(jobResult.data.getId(), {
                worker: workerId,
              });
              processed++;
            }
          }
          return processed;
        };

        const startTime = performance.now();
        const workers = Array.from({ length: level }, (_, i) => worker(i + 1));
        const results = await Promise.all(workers);
        const totalProcessed = results.reduce((sum, count) => sum + count, 0);
        const totalTime = performance.now() - startTime;

        console.log(
          `Concurrency ${level}: Processed ${totalProcessed} jobs in ${totalTime}ms`
        );

        expect(totalProcessed).toBe(jobsCount);
      });
    }
  });
});
