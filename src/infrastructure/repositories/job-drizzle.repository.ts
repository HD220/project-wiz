import {
  Job,
  JobId,
  JobStatus,
  JobName,
  JobPriority,
  JobAttempts,
  ActivityContext,
  ActivityType,
  ActivityHistory,
  ActivityHistoryEntry,
  // JobStatusValue // Not needed directly if JobStatus is used for type
} from '@/core/domain/entities/job';
import { IJobRepository } from '@/core/application/ports/job-repository.interface';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { eq, inArray, asc } from 'drizzle-orm'; // Removed sql, desc
import { jobs, JobsSelect } from '../services/drizzle/schemas/jobs'; // Import JobsSelect for mapJobDataToEntity type

// Custom Error for not found
export class JobNotFoundError extends Error {
  constructor(id: JobId | string) {
    super(`Job with id ${typeof id === 'string' ? id : id.getValue()} not found`);
    this.name = "JobNotFoundError";
  }
}

export class JobRepositoryDrizzle implements IJobRepository {
  constructor(
    private readonly db: BetterSQLite3Database<Record<string, any>> // Use any for db schema for now
  ) {}

  private mapJobDataToEntity(jobData: JobsSelect): Job {
    // Validate and parse 'data' for ActivityContext
    let activityContext: ActivityContext;
    if (typeof jobData.data === 'string') {
      try {
        const parsedData = JSON.parse(jobData.data);
        activityContext = ActivityContext.create({
          type: ActivityType.create(parsedData.type.value || parsedData.type), // Handle if type is already VO or primitive
          history: ActivityHistory.create(
            (parsedData.history.entries || parsedData.history || []).map((entry: any) =>
              ActivityHistoryEntry.create({
                timestamp: new Date(entry.data.timestamp || entry.timestamp),
                actor: entry.data.actor || entry.actor,
                message: entry.data.message || entry.message,
                toolName: entry.data.toolName || entry.toolName,
                toolArgs: entry.data.toolArgs || entry.toolArgs,
                toolResult: entry.data.toolResult || entry.toolResult,
              })
            )
          ),
          currentGoal: parsedData.currentGoal,
        });
      } catch (e) {
        console.error("Failed to parse ActivityContext from DB data:", jobData.data, e);
        // Provide a default/empty ActivityContext if parsing fails
        activityContext = ActivityContext.create({
            type: ActivityType.create('USER_REQUEST'), // Default type
            history: ActivityHistory.create([]),
        });
      }
    } else { // If data is already an object (e.g. from a previous mapping)
        const contextData = jobData.data as any; // Treat as any for now
        activityContext = ActivityContext.create({
            type: ActivityType.create(contextData.type.value || contextData.type),
            history: ActivityHistory.create(
              (contextData.history.entries || contextData.history || []).map((entry: any) =>
                ActivityHistoryEntry.create({
                  timestamp: new Date(entry.data.timestamp || entry.timestamp),
                  actor: entry.data.actor || entry.actor,
                  message: entry.data.message || entry.message,
                  toolName: entry.data.toolName || entry.toolName,
                  toolArgs: entry.data.toolArgs || entry.toolArgs,
                  toolResult: entry.data.toolResult || entry.toolResult,
                })
              )
            ),
            currentGoal: contextData.currentGoal,
        });
    }

    const jobProps = {
      id: JobId.fromString(jobData.id),
      name: JobName.create(jobData.name),
      status: JobStatus.create(jobData.status),
      priority: JobPriority.create(jobData.priority),
      attempts: JobAttempts.create(jobData.currentAttempts, jobData.maxAttempts),
      payload: jobData.payload ? JSON.parse(jobData.payload as string) : undefined,
      result: jobData.result ? JSON.parse(jobData.result as string) : undefined,
      data: activityContext,
      createdAt: new Date(jobData.createdAt),
      updatedAt: new Date(jobData.updatedAt),
      executeAfter: jobData.executeAfter ? new Date(jobData.executeAfter) : undefined,
      dependsOn: jobData.dependsOn ? JSON.parse(jobData.dependsOn as string).map((id: string) => JobId.fromString(id)) : undefined,
    };
    return new Job(jobProps as any); // Bypassing constructor for direct prop setting for now
  }

  async save(job: Job): Promise<void> {
    const jobProps = job.props; // Accessing props directly as per entity structure
    const values = {
      id: jobProps.id.getValue(),
      name: jobProps.name.getValue(),
      status: jobProps.status.getValue(),
      priority: jobProps.priority.getValue(),
      currentAttempts: jobProps.attempts.current,
      maxAttempts: jobProps.attempts.max,
      payload: jobProps.payload ? JSON.stringify(jobProps.payload) : null,
      result: jobProps.result ? JSON.stringify(jobProps.result) : null,
      data: JSON.stringify(jobProps.data.getData()), // Serialize ActivityContext
      createdAt: jobProps.createdAt.getTime(),
      updatedAt: new Date().getTime(), // Always update 'updatedAt' on save
      executeAfter: jobProps.executeAfter ? jobProps.executeAfter.getTime() : null,
      dependsOn: jobProps.dependsOn ? JSON.stringify(jobProps.dependsOn.map(id => id.getValue())) : null,
      failedReason: jobProps.status.isFailed() && jobProps.result && (jobProps.result as any).error
        ? String((jobProps.result as any).error)
        : null,
    };

    // Drizzle's way of upsert for SQLite
    await this.db.insert(jobs)
      .values(values)
      .onConflictDoUpdate({
        target: jobs.id,
        set: {
          name: values.name,
          status: values.status,
          priority: values.priority,
          currentAttempts: values.currentAttempts,
          maxAttempts: values.maxAttempts,
          payload: values.payload,
          result: values.result,
          data: values.data,
          updatedAt: values.updatedAt,
          executeAfter: values.executeAfter,
          dependsOn: values.dependsOn,
          failedReason: values.failedReason,
        }
      });
  }

  async findById(id: JobId): Promise<Job | null> {
    const [jobData] = await this.db
      .select()
      .from(jobs)
      .where(eq(jobs.id, id.getValue()));

    if (!jobData) {
      return null;
    }
    return this.mapJobDataToEntity(jobData);
  }

  async findByStatus(status: JobStatus): Promise<Job[]> {
    const jobsData = await this.db
      .select()
      .from(jobs)
      .where(eq(jobs.status, status.getValue()));

    return jobsData.map(jobData => this.mapJobDataToEntity(jobData));
  }

  async findPendingJobs(limit: number): Promise<Job[]> {
    const jobsData = await this.db
      .select()
      .from(jobs)
      .where(inArray(jobs.status, [JobStatus.pending().getValue(), JobStatus.waiting().getValue()]))
      .orderBy(asc(jobs.priority), asc(jobs.createdAt)) // Higher priority (lower number) first, then older first
      .limit(limit);

    return jobsData.map(jobData => this.mapJobDataToEntity(jobData));
  }

  // Old methods to be removed or refactored if still needed internally by other logic:
  // create, update, delete, list, findByIds, findDependentJobs
  // For now, assume they are covered by save and new finders or are no longer needed.
}
