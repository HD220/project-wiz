// src_refactored/infrastructure/persistence/drizzle/job/drizzle-job.repository.ts
import { and, asc as ascDrizzle, desc, eq, inArray, isNull, lt, or } from 'drizzle-orm';
import { IJobRepository } from '@/core/application/ports/job-repository.interface';
import { JobEntity, JobStatus } from '@/core/domain/job/job.entity';
import { JobIdVO } from '@/core/domain/job/value-objects/job-id.vo';
import { db } from '../drizzle.client';
import * as schema from '../schema';

export class DrizzleJobRepository implements IJobRepository {
  constructor(private readonly db: typeof db) {}

  async save(job: JobEntity<unknown, unknown>): Promise<void> {
    const data = job.toPersistence();
        await this.db.insert(schema.jobsTable).values(data).onConflictDoUpdate({ target: schema.jobsTable.id, set: data });
  }

  async update(job: JobEntity<unknown, unknown>): Promise<void> {
    const data = job.toPersistence();
    await this.db.update(schema.jobsTable).set(data).where(eq(schema.jobsTable.id, data.id));
  }

  async findById(id: JobIdVO): Promise<JobEntity<unknown, unknown> | null> {
    const result = await this.db.query.jobsTable.findFirst({ where: eq(schema.jobsTable.id, id.value) });
    if (!result) return null;
    return JobEntity.fromPersistence(result as any);
  }

  async findNextJobsToProcess(queueName: string, limit: number): Promise<Array<JobEntity<unknown, unknown>>> {
    const now = new Date();
    const results = await this.db.query.jobsTable.findMany({
      where: and(
        eq(schema.jobsTable.queueName, queueName),
        or(
          and(
            eq(schema.jobsTable.status, JobStatus.WAITING),
            isNull(schema.jobsTable.delayUntil)
          ),
          and(
            eq(schema.jobsTable.status, JobStatus.DELAYED),
            lt(schema.jobsTable.delayUntil, now)
          )
        )
      ),
            orderBy: [ascDrizzle(schema.jobsTable.createdAt)],
      limit,
    });
    return results.map(r => JobEntity.fromPersistence(r as any));
  }

  async acquireLock(jobId: JobIdVO, workerId: string, lockUntil: Date): Promise<boolean> {
    const result = await this.db.update(schema.jobsTable)
      .set({ workerId, lockUntil, status: JobStatus.ACTIVE })
      .where(and(eq(schema.jobsTable.id, jobId.value), or(isNull(schema.jobsTable.workerId), lt(schema.jobsTable.lockUntil, new Date()))))
    return result.changes > 0;
  }

  async extendLock(jobId: JobIdVO, workerId: string, lockUntil: Date): Promise<void> {
    await this.db.update(schema.jobsTable)
      .set({ lockUntil })
      .where(and(eq(schema.jobsTable.id, jobId.value), eq(schema.jobsTable.workerId, workerId)));
  }

  async findStalledJobs(queueName: string, olderThan: Date, limit: number): Promise<Array<JobEntity<unknown, unknown>>> {
    const results = await this.db.query.jobsTable.findMany({
      where: and(
        eq(schema.jobsTable.queueName, queueName),
        eq(schema.jobsTable.status, JobStatus.ACTIVE),
        lt(schema.jobsTable.lockUntil, olderThan)
      ),
      limit,
    });
    return results.map(r => JobEntity.fromPersistence(r as any));
  }

  async remove(jobId: JobIdVO): Promise<void> {
    await this.db.delete(schema.jobsTable).where(eq(schema.jobsTable.id, jobId.value));
  }

  async getJobsByStatus(
    queueName: string,
    statuses: JobStatus[],
    start: number = 0,
    end: number = 100,
    asc: boolean = false,
  ): Promise<Array<JobEntity<unknown, unknown>>> {
    const results = await this.db.query.jobsTable.findMany({
      where: and(eq(schema.jobsTable.queueName, queueName), inArray(schema.jobsTable.status, statuses)),
      orderBy: [asc ? ascDrizzle(schema.jobsTable.createdAt) : desc(schema.jobsTable.createdAt)],
      offset: start,
      limit: end - start,
    });
    return results.map(r => JobEntity.fromPersistence(r as any));
  }

  async countJobsByStatus(queueName: string, statuses?: JobStatus[]): Promise<Partial<Record<JobStatus, number>>> {
    const query = this.db.select({
      status: schema.jobsTable.status,
      count: schema.sql`count(*)`,
    }).from(schema.jobsTable)
      .where(
        and(
          eq(schema.jobsTable.queueName, queueName),
          statuses ? inArray(schema.jobsTable.status, statuses) : undefined
        )
      )
      .groupBy(schema.jobsTable.status);

    const results = await query;
    return results.reduce((acc, row) => {
      acc[row.status as JobStatus] = row.count as number;
      return acc;
    }, {} as Partial<Record<JobStatus, number>>);
  }

  async clean(queueName: string, gracePeriodMs: number, limit: number, status?: JobStatus): Promise<number> {
    const now = new Date();
    const finishedOlderThan = new Date(now.getTime() - gracePeriodMs);

    const result = await this.db.delete(schema.jobsTable)
      .where(and(
        eq(schema.jobsTable.queueName, queueName),
        status ? eq(schema.jobsTable.status, status) : undefined,
        lt(schema.jobsTable.finishedOn, finishedOlderThan)
      ))
      // .limit(limit); // limit is not supported in drizzle delete

    return result.changes;
  }
}