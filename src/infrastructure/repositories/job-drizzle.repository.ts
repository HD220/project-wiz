import { Result, ok, error } from '@/shared/result';
import { IJobRepository } from '@/core/ports/repositories/job.repository.interface';
import { Job } from '@/core/domain/entities/job/job.entity';
import { JobBuilder } from '@/core/domain/entities/job/job-builder';
import { DomainError } from '@/core/common/errors';

// Value Object Imports
import { JobId } from '@/core/domain/entities/job/value-objects/job-id.vo';
import { JobName } from '@/core/domain/entities/job/value-objects/job-name.vo';
import { JobStatus, JobStatusType } from '@/core/domain/entities/job/value-objects/job-status.vo';
import { AttemptCount } from '@/core/domain/entities/job/value-objects/attempt-count.vo';
import { JobTimestamp } from '@/core/domain/entities/job/value-objects/job-timestamp.vo';
import { RetryPolicy, RetryPolicyParams } from '@/core/domain/entities/job/value-objects/retry-policy.vo';
import { NoRetryPolicy } from '@/core/domain/entities/job/value-objects/no-retry-policy';
import { IRetryPolicy } from '@/core/domain/entities/job/value-objects/retry-policy.interface';
import { ActivityContext, ActivityContextPropsInput } from '@/core/domain/entities/job/value-objects/activity-context.vo';
import { ActivityType } from '@/core/domain/entities/job/value-objects/activity-type.vo';
import { JobPriority } from '@/core/domain/entities/job/value-objects/job-priority.vo';
import { JobDependsOn } from '@/core/domain/entities/job/value-objects/job-depends-on.vo';
import { RelatedActivityIds } from '@/core/domain/entities/job/value-objects/related-activity-ids.vo';
import { AgentId } from '@/core/domain/entities/agent/value-objects/agent-id.vo';
// Need these for reconstructing ActivityContext fully
import { ActivityHistory } from '@/core/domain/entities/job/value-objects/activity-history.vo';
import { ActivityHistoryEntry } from '@/core/domain/entities/job/value-objects/activity-history-entry.vo';
import { ActivityNotes } from '@/core/domain/entities/job/value-objects/activity-notes.vo';
import { ValidEntryRoles } from '@/core/domain/entities/job/value-objects/entry-role.vo';
import { PlannedStepsCollection } from '@/core/domain/entities/job/value-objects/context-parts/planned-steps.collection';
import { ValidationCriteriaCollection } from '@/core/domain/entities/job/value-objects/context-parts/validation-criteria.collection';
import { ValidationStatus, ValidationStatusType } from '@/core/domain/entities/job/value-objects/context-parts/validation-status.vo';


import { jobsTable, JobDbInsert, JobDbSelect } from '../services/drizzle/schemas/jobs';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { eq, or, and, lte, asc } from 'drizzle-orm'; // Added Drizzle operators

type DBSchema = { jobsTable: typeof jobsTable; /* other tables */ };
type DbTransaction = BetterSQLite3Database<DBSchema>; // Or the specific transaction type from Drizzle

export class JobDrizzleRepository implements IJobRepository {
    constructor(private readonly db: DbTransaction) {}

    private toEntity(row: JobDbSelect): Job {
        const props: JobProps = {
            id: JobId.create(row.id),
            name: JobName.create(row.name),
            status: JobStatus.create(row.status as JobStatusType),
            attempts: AttemptCount.create(row.attempts),
            createdAt: JobTimestamp.create(new Date(row.createdAt)), // Drizzle returns Date for timestamp_ms
            updatedAt: row.updatedAt ? JobTimestamp.create(new Date(row.updatedAt)) : undefined,

            retryPolicy: row.retryPolicy ? RetryPolicy.create(row.retryPolicy as RetryPolicyParams) : NoRetryPolicy.create(),

            payload: row.payload ? row.payload as Record<string, unknown> : undefined,
            metadata: row.metadata ? row.metadata as Record<string, unknown> : undefined,
            data: row.data ? row.data as Record<string, unknown> : undefined, // Assuming 'data' is a distinct field
            result: row.result ? row.result : undefined,

            priority: row.priority !== null && row.priority !== undefined ? JobPriority.create(row.priority) : undefined,

            dependsOn: row.dependsOn ? JobDependsOn.create(row.dependsOn.map(idStr => JobId.create(idStr))) : undefined,

            activityType: row.activityType ? ActivityType.create(row.activityType) : undefined,

            context: row.context ? ActivityContext.create(row.context as ActivityContextPropsInput) : undefined,

            parentId: row.parentId ? JobId.create(row.parentId) : undefined,

            relatedActivityIds: row.relatedActivityIds
                ? RelatedActivityIds.create(row.relatedActivityIds.map(idStr => JobId.create(idStr)))
                : undefined,

            agentId: row.agentId ? AgentId.create(row.agentId) : undefined,
        };
        return Job.create(props); // Use static create method of the Job entity
    }

    private toPersistence(job: Job): JobDbInsert {
        const props = job.getProps();

        let serializableRetryPolicy: RetryPolicyParams | null = null;
        if (props.retryPolicy instanceof RetryPolicy) {
             serializableRetryPolicy = {
                 maxAttempts: props.retryPolicy.getMaxAttempts().getValue(),
                 delayBetweenAttempts: props.retryPolicy.getDelayBetweenAttempts().getValue(),
                 backoffType: props.retryPolicy.getBackoffType().getValue(), // Assumes BackoffTypeVO has getValue
                 maxDelay: props.retryPolicy.getMaxDelay()?.getValue()
             };
        }

        return {
            id: job.id().getValue(),
            name: props.name.getValue(),
            status: props.status.getValue(),
            attempts: props.attempts.getValue(),
            createdAt: props.createdAt.getValue(),
            updatedAt: props.updatedAt?.getValue(),
            payload: props.payload || null,
            retryPolicy: serializableRetryPolicy,
            context: props.context ? (props.context.getProps() as ActivityContextPropsInput) : null, // Use getProps and cast
            priority: props.priority?.getValue(),
            dependsOn: props.dependsOn?.getValues().map(id => id.getValue()) || null,
            activityType: props.activityType?.getValue(),
            parentId: props.parentId?.getValue(),
            relatedActivityIds: props.relatedActivityIds?.getValues().map(id => id.getValue()) || null,
            agentId: props.agentId?.getValue(),
            result: props.result || null,
            metadata: props.metadata || null,
            data: props.data || null, // Assuming 'data' is a distinct field
        };
    }

    async save(job: Job): Promise<Result<Job>> {
        try {
            const jobData = this.toPersistence(job);
            await this.db.insert(jobsTable).values(jobData)
                .onConflictDoUpdate({ target: jobsTable.id, set: jobData });
            return ok(job);
        } catch (e) {
            console.error("Error saving job to database:", e);
            return error(new DomainError("Failed to save job to database.", e instanceof Error ? e : undefined));
        }
    }

    async load(id: JobId): Promise<Result<Job | null>> {
        try {
            const results = await this.db.select().from(jobsTable).where(eq(jobsTable.id, id.getValue())).limit(1);
            if (results.length === 0) {
                return ok(null);
            }
            const row = results[0] as JobDbSelect;
            return ok(this.toEntity(row));
        } catch (e) {
            console.error(`Error loading job ${id.getValue()} from database:`, e);
            return error(new DomainError(`Failed to load job from database. Id: ${id.getValue()}`, e instanceof Error ? e : undefined));
        }
    }

    async findById(id: JobId): Promise<Result<Job | null>> { // Added findById for IRepository compatibility
        return this.load(id);
    }

    async create(job: Job): Promise<Result<Job>> {
      // Save handles create (upsert)
      return this.save(job);
    }

    async update(job: Job): Promise<Result<Job>> {
      // Save handles update (upsert)
      return this.save(job);
    }

    async list(): Promise<Result<Job[]>> {
      try {
        const results = await this.db.select().from(jobsTable).all();
        const jobs = results.map(row => this.toEntity(row as JobDbSelect));
        return ok(jobs);
      } catch (e) {
        console.error("Error listing jobs from database:", e);
        return error(new DomainError("Failed to list jobs from database.", e instanceof Error ? e : undefined));
      }
    }

    async delete(id: JobId): Promise<Result<void>> {
      try {
        const result = await this.db.delete(jobsTable).where(eq(jobsTable.id, id.getValue())).returning();
        if (result.length === 0) {
            return error(new DomainError(`Job with id ${id.getValue()} not found for deletion.`));
        }
        return ok(undefined);
      } catch (e) {
        console.error(`Error deleting job ${id.getValue()} from database:`, e);
        return error(new DomainError("Failed to delete job from database.", e instanceof Error ? e : undefined));
      }
    }

    async findNextProcessableJob(): Promise<Result<Job | null>> {
        try {
            const now = new Date();
            // Query for PENDING jobs or DELAYED jobs whose updatedAt (acting as runAt) is in the past.
            // Order by priority (lower number is higher priority) then by creation date.
            // jobsTable.updatedAt is nullable, ensure lte handles nulls as "not ready" or filter them out.
            // Assuming jobsTable.priority is also nullable and lower is better.
            const results = await this.db.select().from(jobsTable)
                .where(
                    or(
                        eq(jobsTable.status, JobStatus.create("PENDING").getValue()),
                        and(
                            eq(jobsTable.status, JobStatus.create("DELAYED").getValue()),
                            jobsTable.updatedAt ? lte(jobsTable.updatedAt, now) : undefined // Only consider if updatedAt is not null
                        )
                    )
                )
                .orderBy(asc(jobsTable.priority), asc(jobsTable.createdAt))
                .limit(1);

            if (results.length === 0) {
                return ok(null);
            }
            return ok(this.toEntity(results[0] as JobDbSelect));
        } catch (e) {
            console.error("Error in JobDrizzleRepository.findNextProcessableJob:", e);
            return error(new DomainError("Failed to find next processable job.", e instanceof Error ? e : undefined));
        }
    }
}
