import { eq } from "drizzle-orm";
import { db } from "../../services/drizzle";
import { queues as queuesTable } from "../../services/drizzle/schemas/queues";
import { jobs as jobsTable } from "../../services/drizzle/schemas/jobs";
import { IQueueRepository } from "../../../core/ports/repositories/queue.interface";
import {
  Queue,
  type QueueConstructor,
} from "../../../core/domain/entities/queue";
import { Job } from "../../../core/domain/entities/jobs";
import { JobStatus } from "../../../core/domain/entities/jobs/job-status";

export class DrizzleQueueRepository implements IQueueRepository {
  private toJobInsert(job: Job) {
    return {
      id: job.id,
      queueId: job.queueId,
      name: job.name,
      data: job.data,
      opts: {
        ...job.opts,
        priority: job.opts.priority,
        delay: job.opts.delay,
      },
      status: job.status.current,
      delayedUntil: job.delayedUntil,
      updatedAt: job.updatedAt,
      startedAt: job.startedAt,
      finishedAt: job.finishedAt,
      failedReason: job.failedReason,
    };
  }

  async create(props: Omit<QueueConstructor, "id">): Promise<Queue> {
    const data = await db.transaction(async (tx) => {
      const [insertedQueue] = await tx
        .insert(queuesTable)
        .values({
          name: props.name,
          concurrency: props.concurrency, //falta o getter na entity e construtor
          createdAt: props.createdAt,
          updatedAt: props.updatedAt,
        })
        .returning();

      const insertedJobs = await Promise.all(
        props.jobs.map(async (job) => {
          const [insertedJob] = await tx
            .insert(jobsTable)
            .values({
              data: job.data,
              name: job.name,
              opts: job.opts,
              queueId: job.queueId,
              status: job.status.current,
              delayedUntil: job.delayedUntil,
              failedReason: job.failedReason,
              finishedAt: job.finishedAt,
              startedAt: job.startedAt,
              updatedAt: new Date(),
            })
            .returning();

          return insertedJob;
        })
      );

      return { ...insertedQueue, jobs: insertedJobs };
    });

    return new Queue({
      ...data,
      jobs: data.jobs.map(
        (job) =>
          new Job({
            ...job,
            status: new JobStatus(job.status),
          })
      ),
    });
  }

  async save(queue: Queue): Promise<Queue> {
    // Atualiza a fila
    await db
      .update(queuesTable)
      .set({
        name: queue.name,
        concurrency: queue.concurrency,
        updatedAt: new Date(),
      })
      .where(eq(queuesTable.id, queue.id));

    // Atualiza os jobs
    await Promise.all(
      queue.jobs.map((job) =>
        db
          .insert(jobsTable)
          .values(this.toJobInsert(job))
          .onConflictDoUpdate({
            target: [jobsTable.id],
            set: this.toJobInsert(job),
          })
      )
    );

    return queue;
  }

  async load(id: string): Promise<Queue> {
    const [queue] = await db
      .select()
      .from(queuesTable)
      .where(eq(queuesTable.id, id));

    if (!queue) {
      throw new Error(`Queue with id ${id} not found`);
    }

    const jobs = await db
      .select()
      .from(jobsTable)
      .where(eq(jobsTable.queueId, id));

    return new Queue({
      id: queue.id,
      name: queue.name,
      concurrency: queue.concurrency,
      jobs: jobs.map(
        (job) =>
          new Job({
            id: job.id,
            queueId: job.queueId,
            name: job.name,
            data: job.data,
            opts: job.opts,
            status: new JobStatus(job.status),
            delayedUntil: job.delayedUntil,
            updatedAt: job.updatedAt,
            startedAt: job.startedAt,
            finishedAt: job.finishedAt,
            failedReason: job.failedReason,
          })
      ),
      createdAt: queue.createdAt,
      updatedAt: queue.updatedAt,
    });
  }

  async list(): Promise<Queue[]> {
    const allQueues = await db.select().from(queuesTable);
    const allJobs = await db.select().from(jobsTable);

    return Promise.all(
      allQueues.map(async (queue) => {
        const queueJobs = allJobs.filter((job) => job.queueId === queue.id);

        return new Queue({
          id: queue.id,
          name: queue.name,
          concurrency: queue.concurrency,
          jobs: queueJobs.map(
            (job) =>
              new Job({
                id: job.id,
                queueId: job.queueId,
                name: job.name,
                data: job.data,
                opts: job.opts,
                status: new JobStatus(job.status),
                delayedUntil: job.delayedUntil,
                updatedAt: job.updatedAt,
                startedAt: job.startedAt,
                finishedAt: job.finishedAt,
                failedReason: job.failedReason,
              })
          ),
          createdAt: queue.createdAt,
          updatedAt: queue.updatedAt,
        });
      })
    );
  }

  async delete(id: string): Promise<void> {
    await db.transaction(async (tx) => {
      await tx.delete(jobsTable).where(eq(jobsTable.queueId, id));
      await tx.delete(queuesTable).where(eq(queuesTable.id, id));
    });
  }
}
