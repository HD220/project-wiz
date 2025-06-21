import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { setupTestDB, teardownTestDB } from "../../setup/drizzle";
import { DrizzleQueueRepository } from "@/infrastructure/repositories/drizzle/queue.repository";
import type { ILogger } from "@/core/ports/logger/ilogger.interface";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { eq } from "drizzle-orm";
import { queues } from "@/infrastructure/services/drizzle/schemas/queues";
import { jobs } from "@/infrastructure/services/drizzle/schemas/jobs";
import { Queue } from "@/core/domain/entities/queue/queue.entity";
import { Job } from "@/core/domain/entities/jobs/job.entity";
import { JobStatusValues } from "@/core/domain/entities/jobs/job-status";
import { Result, ResultOk } from "@/shared/result";

// Implementação concreta para testes
class TestJob extends Job {
  constructor(
    id: string,
    public readonly name: string,
    public readonly payload: Record<string, unknown> = {},
    options: { priority?: number } = {}
  ) {
    super(id, JobStatusValues.WAITING, options.priority);
  }

  async execute(): Promise<Result<any>> {
    // Implementação simples para testes
    return { success: true, data: { success: true } } as ResultOk<any>;
  }
}

describe("Queue Integration Tests", () => {
  let queueRepository: DrizzleQueueRepository;
  let sqlite: Database.Database;
  let db: ReturnType<typeof drizzle>;

  beforeEach(async () => {
    const { db: testDb, sqlite: testSqlite } = await setupTestDB();
    db = testDb;
    sqlite = testSqlite;

    // Mock do logger
    const loggerMock: ILogger = {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
    };

    queueRepository = new DrizzleQueueRepository(loggerMock, db);
  });

  afterEach(async () => {
    await teardownTestDB({ sqlite });
  });

  afterEach(() => {
    sqlite.close();
  });

  describe("Queue Operations", () => {
    it("should create and persist a queue", async () => {
      const queue = new Queue("test-queue", "Test Queue");
      const result = await queueRepository.create(queue);

      expect(result).toBeInstanceOf(Queue);
      expect(result.getId()).toBe("test-queue");

      const [dbQueue] = await db
        .select()
        .from(queues)
        .where(eq(queues.id, "test-queue"));
      expect(dbQueue).toBeDefined();
    });

    it("should find a queue by id", async () => {
      const queue = new Queue("find-queue", "Find Queue");
      await queueRepository.create(queue);

      const found = await queueRepository.findById("find-queue");
      expect(found).toBeInstanceOf(Queue);
      expect(found?.getName()).toBe("Find Queue");
    });

    describe("Job Priority Ordering", () => {
      it("should return jobs ordered by priority (highest first)", async () => {
        const queue = new Queue("priority-queue", "Priority Queue");
        await queueRepository.create(queue);

        // Adiciona jobs com prioridades variadas
        const job1 = new TestJob("job-1", "Job 1", {}, { priority: 5 });
        const job2 = new TestJob("job-2", "Job 2", {}, { priority: 1 });
        const job3 = new TestJob("job-3", "Job 3", {}, { priority: 10 });
        const job4 = new TestJob("job-4", "Job 4", {}, { priority: 2 });

        queue.addJob(job1);
        queue.addJob(job2);
        queue.addJob(job3);
        queue.addJob(job4);
        await queueRepository.save(queue);

        // Verifica a ordem de retorno (deveria ser 10, 5, 2, 1)
        const firstJobResult = await queueRepository.getNextJob();
        expect(firstJobResult.success).toBe(true);
        expect(firstJobResult.data?.getId()).toBe("job-3"); // Prioridade 10

        await queueRepository.markJobAsCompleted(
          firstJobResult.data!.getId(),
          {}
        );

        const secondJobResult = await queueRepository.getNextJob();
        expect(secondJobResult.success).toBe(true);
        expect(secondJobResult.data?.getId()).toBe("job-1"); // Prioridade 5

        await queueRepository.markJobAsCompleted(
          secondJobResult.data!.getId(),
          {}
        );

        const thirdJobResult = await queueRepository.getNextJob();
        expect(thirdJobResult.success).toBe(true);
        expect(thirdJobResult.data?.getId()).toBe("job-4"); // Prioridade 2

        await queueRepository.markJobAsCompleted(
          thirdJobResult.data!.getId(),
          {}
        );

        const fourthJobResult = await queueRepository.getNextJob();
        expect(fourthJobResult.success).toBe(true);
        expect(fourthJobResult.data?.getId()).toBe("job-2"); // Prioridade 1
      });

      it("should handle edge cases (min and max priority)", async () => {
        const queue = new Queue("edge-queue", "Edge Queue");
        await queueRepository.create(queue);

        const jobMin = new TestJob("job-min", "Job Min", {}, { priority: 1 });
        const jobMax = new TestJob("job-max", "Job Max", {}, { priority: 10 });

        queue.addJob(jobMin);
        queue.addJob(jobMax);
        await queueRepository.save(queue);

        const firstJobResult = await queueRepository.getNextJob();
        expect(firstJobResult.success).toBe(true);
        expect(firstJobResult.data?.getId()).toBe("job-max"); // Prioridade 10

        await queueRepository.markJobAsCompleted(
          firstJobResult.data!.getId(),
          {}
        );

        const secondJobResult = await queueRepository.getNextJob();
        expect(secondJobResult.success).toBe(true);
        expect(secondJobResult.data?.getId()).toBe("job-min"); // Prioridade 1
      });

      it("should handle jobs with same priority (FIFO)", async () => {
        const queue = new Queue("same-priority-queue", "Same Priority Queue");
        await queueRepository.create(queue);

        const job1 = new TestJob("job-1", "Job 1", {}, { priority: 5 });
        const job2 = new TestJob("job-2", "Job 2", {}, { priority: 5 });

        // Adiciona com pequeno delay para garantir timestamps diferentes
        queue.addJob(job1);
        await new Promise((resolve) => setTimeout(resolve, 10));
        queue.addJob(job2);
        await queueRepository.save(queue);

        const firstJobResult = await queueRepository.getNextJob();
        const secondJobResult = await queueRepository.getNextJob();

        expect(firstJobResult.success).toBe(true);
        expect(secondJobResult.success).toBe(true);
        expect(firstJobResult.data?.getId()).toBe("job-1");
        expect(secondJobResult.data?.getId()).toBe("job-2");
      });

      it("should use default priority (0) when not specified and validate priority range", async () => {
        const queue = new Queue(
          "default-priority-queue",
          "Default Priority Queue"
        );
        await queueRepository.create(queue);

        const job1 = new TestJob("job-1", "Job 1");
        const job2 = new TestJob("job-2", "Job 2", {}, { priority: 1 });

        // Testa prioridade padrão
        expect(job1.getPriority()).toBe(0);

        // Testa prioridade explícita
        expect(job2.getPriority()).toBe(1);

        // Testa limites de prioridade
        const jobMaxPriority = new TestJob(
          "job-max",
          "Job Max",
          {},
          { priority: 10 }
        );
        expect(jobMaxPriority.getPriority()).toBe(10);

        // Testa que prioridade negativa é rejeitada
        expect(
          () => new TestJob("job-invalid", "Job Invalid", {}, { priority: -1 })
        ).toThrow("Priority must be between 0 and 10");

        queue.addJob(job1);
        queue.addJob(job2);
        await queueRepository.save(queue);

        // Job com prioridade explícita deve vir primeiro mesmo sendo 1
        // pois o default deve ser menor (0 ou negativo)
        const firstJobResult = await queueRepository.getNextJob();
        expect(firstJobResult.success).toBe(true);
        expect(firstJobResult.data?.getId()).toBe("job-2");
      });
    });
  });

  describe("Job Operations", () => {
    it("should add and process jobs", async () => {
      const queue = new Queue("job-queue", "Job Queue");
      await queueRepository.create(queue);

      const job = new TestJob("test-job", "Test Job", { data: "test" });
      queue.addJob(job);
      await queueRepository.save(queue);

      const [dbJob] = await db
        .select()
        .from(jobs)
        .where(eq(jobs.queueId, "job-queue"));
      expect(dbJob).toBeDefined();
      expect(dbJob.name).toBe("Test Job");
    });

    it("should handle job status transitions", async () => {
      const queue = new Queue("status-queue", "Status Queue");
      await queueRepository.create(queue);

      const job = new TestJob("status-job", "Status Job", {});
      queue.addJob(job);
      await queueRepository.save(queue);

      // Mark as completed directly (since markJobAsStarted isn't available)
      await queueRepository.markJobAsCompleted("status-job", {
        result: "success",
      });
      const [dbJob] = await db
        .select()
        .from(jobs)
        .where(eq(jobs.id, "status-job"));
      expect(dbJob.status).toBe("COMPLETED");
    });
  });

  describe("Concurrency Tests", () => {
    it("should handle multiple workers getting jobs", async () => {
      const queue = new Queue("concurrency-queue", "Concurrency Queue");
      await queueRepository.create(queue);

      // Adiciona 10 jobs
      for (let i = 0; i < 10; i++) {
        const job = new TestJob(`job-${i}`, `Job ${i}`, {}, { priority: i });
        queue.addJob(job);
      }
      await queueRepository.save(queue);

      // Simula 3 workers buscando jobs simultaneamente
      const workerPromises = Array.from({ length: 3 }, async () => {
        const jobs = [];
        for (let i = 0; i < 4; i++) {
          // Cada worker tenta pegar 4 jobs
          const jobResult = await queueRepository.getNextJob();
          if (jobResult.success && jobResult.data) {
            jobs.push(jobResult.data.getId());
            await queueRepository.markJobAsCompleted(
              jobResult.data.getId(),
              {}
            );
          }
        }
        return jobs;
      });

      const workersResults = await Promise.all(workerPromises);
      const allProcessedJobs = workersResults.flat();

      // Verifica que todos os jobs foram processados exatamente uma vez
      expect(allProcessedJobs).toHaveLength(10);
      expect(new Set(allProcessedJobs).size).toBe(10); // Sem duplicatas
    });

    it("should prevent duplicate processing of the same job", async () => {
      const queue = new Queue("lock-queue", "Lock Queue");
      await queueRepository.create(queue);

      const job = new TestJob("locked-job", "Locked Job", {}, { priority: 1 });
      queue.addJob(job);
      await queueRepository.save(queue);

      // Dois workers tentam pegar o mesmo job simultaneamente
      const [job1, job2] = await Promise.all([
        queueRepository.getNextJob(),
        queueRepository.getNextJob(),
      ]);

      // Apenas um worker deve conseguir o job
      expect(
        job1?.getId() === "locked-job" || job2?.getId() === "locked-job"
      ).toBe(true);
      expect(
        job1?.getId() === "locked-job" && job2?.getId() === "locked-job"
      ).toBe(false);
    });
  });

  describe("Error Handling", () => {
    it("should handle job failures", async () => {
      const queue = new Queue("error-queue", "Error Queue");
      await queueRepository.create(queue);

      const job = new TestJob("error-job", "Error Job", {});
      queue.addJob(job);
      await queueRepository.save(queue);

      await queueRepository.markJobAsFailed(
        "error-job",
        new Error("Test error")
      );
      const [dbJob] = await db
        .select()
        .from(jobs)
        .where(eq(jobs.id, "error-job"));

      expect(dbJob.status).toBe("FAILED");
      expect(dbJob.failedReason).toBe("Test error");
    });
  });
});
