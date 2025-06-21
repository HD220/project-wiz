import { eq, and, or, lt, isNull, sql } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type { SQLiteTransaction } from "drizzle-orm/sqlite-core";
import { queues as queuesTable } from "../../services/drizzle/schemas/queues";
import { GetNextJobError } from "../../../core/domain/errors/get-next-job.error";
import {
  jobs as jobsTable,
  JobsInsert,
} from "../../services/drizzle/schemas/jobs";
import { JobStatusValues } from "../../../core/domain/entities/jobs/job-status";
import { IQueueRepository } from "../../../core/ports/repositories/iqueue-repository.interface";
import { Queue } from "../../../core/domain/entities/queue/queue.entity";
import { Job } from "../../../core/domain/entities/jobs/job.entity";
import { Result } from "../../../shared/result";
import { TransactionWrapper } from "../../services/drizzle/transaction-wrapper";
import { ILogger } from "../../../core/ports/logger/ilogger.interface";

type JobStatusType = (typeof JobStatusValues)[keyof typeof JobStatusValues];

interface JobData {
  id: string;
  queueId: string;
  name: string;
  data: Record<string, unknown>;
  opts: {
    priority: number;
    delay: number;
  };
  status: JobStatusType;
  delayedUntil?: Date | null;
  updatedAt: Date;
  startedAt?: Date | null;
  finishedAt?: Date | null;
  failedReason?: string | null;
}

export class DrizzleQueueRepository implements IQueueRepository<Queue, Job> {
  private readonly logger: ILogger;
  private readonly db: BetterSQLite3Database;

  constructor(logger: ILogger, db: BetterSQLite3Database) {
    this.logger = logger;
    this.db = db;
  }

  private async runInTransaction<T>(
    operation: (tx: SQLiteTransaction<any, any, any, any>) => Promise<T>
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        operation(tx).then(resolve).catch(reject);
      });
    });
  }

  private toJobData(job: Job): JobsInsert {
    const jobAny = job as any;
    const statusMap: Record<string, JobStatusType> = {
      WAITING: JobStatusValues.WAITING,
      ACTIVE: JobStatusValues.ACTIVE,
      COMPLETED: JobStatusValues.COMPLETED,
      FAILED: JobStatusValues.FAILED,
      DELAYED: JobStatusValues.DELAYED,
    };

    return {
      id: job.getId(),
      queueId: jobAny.queueId,
      name: jobAny.name,
      data: jobAny.data || {},
      opts: {
        priority: jobAny.priority || 1,
        delay: jobAny.delay || 0,
        ...jobAny.opts,
      },
      status: statusMap[job.getStatus().current] || JobStatusValues.WAITING,
      updatedAt: new Date(),
      delayedUntil: jobAny.delayedUntil,
      startedAt: jobAny.startedAt,
      finishedAt: jobAny.finishedAt,
      failedReason: jobAny.failedReason,
    };
  }

  async save(queue: Queue): Promise<void> {
    if (!queue) {
      throw new Error("Queue parameter cannot be null or undefined");
    }

    const queueId = queue.getId();
    if (!queueId) {
      throw new Error("Queue ID cannot be null or undefined");
    }

    const queueAny = queue as any;
    const jobs = queueAny.jobs as Job[];

    return this.runInTransaction(async (tx) => {
      // Atualiza a fila
      await tx
        .update(queuesTable)
        .set({
          name: queueAny.name,
          concurrency: queueAny.concurrency || 1,
          updatedAt: new Date(),
        })
        .where(eq(queuesTable.id, queueId));

      // Atualiza os jobs
      if (jobs?.length) {
        for (const job of jobs) {
          if (!job) continue;

          const jobData = this.toJobData(job);
          if (!jobData.id || !jobData.queueId) {
            throw new Error("Job ID and queueId are required");
          }

          await tx
            .insert(jobsTable)
            .values(jobData)
            .onConflictDoUpdate({
              target: [jobsTable.id, jobsTable.queueId],
              set: jobData,
            });
        }
      }
    });
  }

  async getNextJob(): Promise<Result<Job | null>> {
    try {
      const now = new Date();

      const [job] = await this.db
        .select()
        .from(jobsTable)
        .where(
          and(
            or(
              eq(jobsTable.status, "waiting"),
              and(
                eq(jobsTable.status, "delayed"),
                lt(jobsTable.delayedUntil, now)
              )
            ),
            or(
              isNull(jobsTable.startedAt),
              lt(jobsTable.startedAt, new Date(now.getTime() - 30 * 60 * 1000))
            )
          )
        )
        .orderBy(
          sql`CAST(${jobsTable.opts}->>'priority' AS INTEGER) DESC`,
          jobsTable.updatedAt
        )
        .limit(1);

      if (!job) return { success: true, data: null };

      if (!job.id || !job.queueId || !job.status) {
        this.logger.error("Invalid job data retrieved from database:", { job });
        return {
          success: false,
          error: {
            name: "InvalidJobData",
            message: "Invalid job data retrieved from database",
          },
        };
      }

      const jobEntity = {
        getId: () => job.id,
        getStatus: () => ({ current: job.status.toUpperCase() }),
        getCreatedAt: () => new Date(),
        getUpdatedAt: () => new Date(),
        ...job,
      } as unknown as Job;

      return { success: true, data: jobEntity };
    } catch (error) {
      this.logger.error("Failed to get next job", { error });
      return {
        success: false,
        error: new GetNextJobError(
          "Failed to retrieve next job",
          error instanceof Error ? error : undefined
        ),
      };
    }
  }

  async markJobAsCompleted(id: string, result: any): Promise<void> {
    if (!id) {
      throw new Error("Job ID cannot be null or undefined");
    }

    return this.runInTransaction(async (tx) => {
      await tx
        .update(jobsTable)
        .set({
          status: "completed",
          finishedAt: new Date(),
          updatedAt: new Date(),
          data: result ? { ...result } : null,
        })
        .where(eq(jobsTable.id, id));
    });
  }

  async markJobAsFailed(id: string, error: Error): Promise<void> {
    if (!id) {
      throw new Error("Job ID cannot be null or undefined");
    }
    if (!error) {
      throw new Error("Error object cannot be null or undefined");
    }

    return this.runInTransaction(async (tx) => {
      await tx
        .update(jobsTable)
        .set({
          status: "failed",
          finishedAt: new Date(),
          updatedAt: new Date(),
          failedReason: error.message || "Unknown error",
        })
        .where(eq(jobsTable.id, id));
    });
  }

  async markJobAsStarted(id: string): Promise<void> {
    if (!id) {
      throw new Error("Job ID cannot be null or undefined");
    }

    return this.runInTransaction(async (tx) => {
      await tx
        .update(jobsTable)
        .set({
          status: "active",
          startedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(jobsTable.id, id));
    });
  }

  async markJobAsDelayed(id: string, delayUntil: Date): Promise<void> {
    if (!id) {
      throw new Error("Job ID cannot be null or undefined");
    }
    if (!delayUntil) {
      throw new Error("DelayUntil date cannot be null or undefined");
    }

    return this.runInTransaction(async (tx) => {
      await tx
        .update(jobsTable)
        .set({
          status: "delayed",
          delayedUntil: delayUntil,
          updatedAt: new Date(),
        })
        .where(eq(jobsTable.id, id));
    });
  }

  async create(queue: Queue): Promise<Queue> {
    if (!queue) {
      throw new Error("Queue parameter cannot be null or undefined");
    }

    const queueId = queue.getId();
    const queueName = queue.getName();

    if (!queueId || !queueName) {
      throw new Error("Queue must have both ID and name");
    }

    const jobs = ((queue as any).jobs as Job[]) || [];

    for (const job of jobs) {
      if (!job?.getId()) {
        throw new Error("All jobs must have an ID");
      }

      const priority = job.getPriority();
      if (priority < 1 || priority > 10) {
        throw new Error(
          `Job ${job.getId()} has invalid priority (must be 1-10)`
        );
      }
    }

    let createdQueue: Queue | undefined;

    await this.runInTransaction(async (tx) => {
      await tx.insert(queuesTable).values({
        id: queueId,
        name: queueName,
        createdAt: queue.getCreatedAt(),
        updatedAt: queue.getUpdatedAt(),
      });

      if (jobs.length) {
        for (const job of jobs) {
          const jobData = this.toJobData(job);
          await tx.insert(jobsTable).values(jobData);
        }
      }

      createdQueue = queue;
    });

    if (!createdQueue) {
      throw new Error(
        "Failed to create queue - transaction completed but queue not created"
      );
    }

    return createdQueue;
  }

  async findById(id: string): Promise<Queue | null> {
    if (!id) {
      throw new Error("Queue ID cannot be null or undefined");
    }

    const [queue] = await this.db
      .select()
      .from(queuesTable)
      .where(eq(queuesTable.id, id))
      .limit(1);

    if (!queue) return null;

    const jobs = await this.db
      .select()
      .from(jobsTable)
      .where(eq(jobsTable.queueId, id));

    const queueEntity = new Queue(queue.id, queue.name);
    (queueEntity as any).createdAt = new Date(queue.createdAt);
    (queueEntity as any).updatedAt = new Date(queue.updatedAt);

    if (jobs.length) {
      (queueEntity as any).jobs = jobs.map((job) => ({
        getId: () => job.id,
        getStatus: () => ({ current: job.status.toUpperCase() }),
        ...job,
      }));
    }

    return queueEntity;
  }

  async update(queue: Queue): Promise<Queue> {
    if (!queue) {
      throw new Error("Queue parameter cannot be null or undefined");
    }

    const queueId = queue.getId();
    if (!queueId) {
      throw new Error("Queue ID cannot be null or undefined");
    }

    try {
      await this.save(queue);
      return queue;
    } catch (error) {
      this.logger.error("Failed to update queue", { queueId, error });
      throw new Error(`Failed to update queue: ${queueId}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    if (!id) {
      throw new Error("Queue ID cannot be null or undefined");
    }

    try {
      await this.runInTransaction(async (tx) => {
        await tx.delete(jobsTable).where(eq(jobsTable.queueId, id));
        await tx.delete(queuesTable).where(eq(queuesTable.id, id));
      });
      return true;
    } catch (error) {
      this.logger.error("Failed to delete queue", {
        error: error instanceof Error ? error.message : String(error),
        queueId: id,
      });
      return false;
    }
  }

  async findAll(): Promise<Queue[]> {
    try {
      const queues = await this.db.select().from(queuesTable);
      if (!queues.length) return [];

      return await Promise.all(
        queues.map(async (queue) => {
          const jobs = await this.db
            .select()
            .from(jobsTable)
            .where(eq(jobsTable.queueId, queue.id));

          const queueEntity = new Queue(queue.id, queue.name);
          (queueEntity as any).createdAt = new Date(queue.createdAt);
          (queueEntity as any).updatedAt = new Date(queue.updatedAt);

          if (jobs.length) {
            (queueEntity as any).jobs = jobs.map((job) => ({
              getId: () => job.id,
              getStatus: () => ({ current: job.status.toUpperCase() }),
              ...job,
            }));
          }

          return queueEntity;
        })
      );
    } catch (error) {
      this.logger.error("Failed to find all queues", { error });
      throw new Error("Failed to find all queues");
    }
  }
}
