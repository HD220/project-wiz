import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
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
  JobStatusValues,
} from "@/core/domain/entities/jobs/job-status";
import { Result } from "@/shared/result";

class RollbackTestJob extends Job {
  constructor(
    id: string,
    public readonly name: string,
    public readonly payload: Record<string, unknown> = {},
    options: { priority?: number } = {}
  ) {
    super(id, new JobStatus(JobStatusValues.WAITING), options.priority);
  }

  async execute(): Promise<Result<any>> {
    return { success: true, data: this.payload };
  }
}

describe("Queue Rollback Tests", () => {
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

  describe("Transaction Rollback", () => {
    it("should rollback when saving a queue fails", async () => {
      const queue = new Queue("rollback-queue", "Rollback Test Queue");
      await queueRepository.create(queue);

      // Adiciona jobs válidos
      const validJob = new RollbackTestJob("valid-job", "Valid Job");
      queue.addJob(validJob);

      // Mock para simular falha durante o save
      const originalSave = queueRepository.save;
      vi.spyOn(queueRepository, "save").mockImplementationOnce(async () => {
        await originalSave.call(queueRepository, queue);
        throw new Error("Simulated failure");
      });

      try {
        await queueRepository.save(queue);
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeDefined();
      }

      // Verifica se nenhum job foi persistido
      const dbJobs = await db.select().from(jobs);
      expect(dbJobs).toHaveLength(0);
    });

    it("should rollback when marking job as completed fails", async () => {
      const queue = new Queue("rollback-job-queue", "Rollback Job Queue");
      await queueRepository.create(queue);

      const job = new RollbackTestJob("rollback-job", "Rollback Job");
      queue.addJob(job);
      await queueRepository.save(queue);

      // Mock para simular falha durante markJobAsCompleted
      const originalMark = queueRepository.markJobAsCompleted;
      vi.spyOn(queueRepository, "markJobAsCompleted").mockImplementationOnce(
        async (id, result) => {
          await originalMark.call(queueRepository, id, result);
          throw new Error("Simulated failure");
        }
      );

      const nextJob = await queueRepository.getNextJob();
      expect(nextJob).toBeDefined();

      try {
        await queueRepository.markJobAsCompleted(nextJob!.getId(), {});
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeDefined();
      }

      // Verifica se o job não foi marcado como completed
      const [dbJob] = await db
        .select()
        .from(jobs)
        .where(eq(jobs.id, "rollback-job"));
      expect(dbJob.status).not.toBe("completed");
    });

    it("should maintain consistency when partial operations fail", async () => {
      const queue = new Queue("partial-fail-queue", "Partial Fail Queue");
      await queueRepository.create(queue);

      // Adiciona jobs
      const job1 = new RollbackTestJob("job-1", "Job 1");
      const job2 = new RollbackTestJob("job-2", "Job 2");
      queue.addJob(job1);
      queue.addJob(job2);

      // Mock para falhar no segundo job
      let callCount = 0;
      const originalSave = queueRepository.save;
      vi.spyOn(queueRepository, "save").mockImplementation(async (queue) => {
        if (callCount++ === 1) {
          throw new Error("Simulated failure on second job");
        }
        return originalSave.call(queueRepository, queue);
      });

      try {
        await queueRepository.save(queue);
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeDefined();
      }

      // Verifica se nenhum job foi persistido
      const dbJobs = await db.select().from(jobs);
      expect(dbJobs).toHaveLength(0);
    });

    describe("Nested Transactions", () => {
      it("should handle nested transactions correctly", async () => {
        const queue = new Queue("nested-tx-queue", "Nested Transactions Queue");
        await queueRepository.create(queue);

        const job1 = new RollbackTestJob("job-1", "Job 1");
        const job2 = new RollbackTestJob("job-2", "Job 2");
        queue.addJob(job1);
        queue.addJob(job2);

        // Simula uma operação com transação aninhada que falha
        try {
          await db.transaction(async (tx) => {
            // Primeira operação bem sucedida
            await tx.insert(jobs).values({
              id: "temp-job",
              queueId: queue.getId(),
              name: "Temp Job",
              status: "waiting",
              data: {},
              opts: { priority: 1 },
              updatedAt: new Date(),
            });

            // Segunda operação que falha
            throw new Error("Simulated nested transaction failure");
          });
          expect.fail("Should have thrown an error");
        } catch (error) {
          expect(error).toBeDefined();
        }

        // Verifica se a transação foi revertida
        const tempJob = await db
          .select()
          .from(jobs)
          .where(eq(jobs.id, "temp-job"));
        expect(tempJob).toHaveLength(0);

        // Verifica se os jobs originais ainda podem ser salvos
        await queueRepository.save(queue);
        const dbJobs = await db
          .select()
          .from(jobs)
          .where(eq(jobs.queueId, queue.getId()));
        expect(dbJobs).toHaveLength(2);
      });
    });
  });

  describe("Error Recovery", () => {
    it("should recover from failed jobs and allow reprocessing", async () => {
      const queue = new Queue("recovery-queue", "Recovery Queue");
      await queueRepository.create(queue);

      const job = new RollbackTestJob("recovery-job", "Recovery Job");
      queue.addJob(job);
      await queueRepository.save(queue);

      // Simula falha no processamento
      await queueRepository.markJobAsFailed(
        "recovery-job",
        new Error("Processing failed")
      );

      // Verifica status do job
      const [failedJob] = await db
        .select()
        .from(jobs)
        .where(eq(jobs.id, "recovery-job"));
      expect(failedJob.status).toBe("failed");

      // Reseta o job para tentar novamente
      await db
        .update(jobs)
        .set({ status: "waiting", failedReason: null })
        .where(eq(jobs.id, "recovery-job"));

      // Tenta processar novamente
      const nextJob = await queueRepository.getNextJob();
      expect(nextJob?.getId()).toBe("recovery-job");

      await queueRepository.markJobAsCompleted(nextJob!.getId(), {});
      const [completedJob] = await db
        .select()
        .from(jobs)
        .where(eq(jobs.id, "recovery-job"));
      expect(completedJob.status).toBe("completed");
    });
  });
});
