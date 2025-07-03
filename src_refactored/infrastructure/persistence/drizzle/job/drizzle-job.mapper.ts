import { JobStatus } from "@/core/domain/job/job.entity";
import {
  JobPersistenceData,
} from "@/core/domain/job/job.types";
import { IJobOptions } from "@/core/domain/job/value-objects/job-options.vo";

import * as schema from "../schema";

export function mapToPersistenceData<P, R>(
  jobData: schema.JobSelect
): JobPersistenceData<P, R> {
  const options = jobData.options as IJobOptions;
  const logs =
    (jobData.logs as Array<{
      message: string;
      level: string;
      timestamp: number;
    }>) || [];
  const payload = jobData.payload as P;
  const returnValue = jobData.returnValue as R | null;
  const progress = jobData.progress as number | object;
  const stacktrace = jobData.stacktrace as string[] | null;

  return {
    id: jobData.id,
    queueName: jobData.queueName,
    name: jobData.name,
    payload: payload,
    options: options,
    priority: options.priority,
    status: jobData.status as JobStatus,
    attemptsMade: jobData.attemptsMade,
    progress: progress,
    logs: logs,
    createdAt: jobData.createdAt.getTime(),
    updatedAt: jobData.updatedAt.getTime(),
    processedOn: jobData.processedOn ? jobData.processedOn.getTime() : null,
    finishedOn: jobData.finishedOn ? jobData.finishedOn.getTime() : null,
    delayUntil: jobData.delayUntil ? jobData.delayUntil.getTime() : null,
    lockUntil: jobData.lockUntil ? jobData.lockUntil.getTime() : null,
    workerId: jobData.workerId,
    returnValue: returnValue,
    failedReason: jobData.failedReason,
    stacktrace: stacktrace,
  };
}

export function mapToDrizzleInput<P = unknown, R = unknown>(
  data: JobPersistenceData<P, R>
): typeof schema.jobsTable.$inferInsert {
  // Ensure all fields expected by schema.jobsTable.$inferInsert are present
  // and correctly typed from JobPersistenceData.
  // JobPersistenceData now includes 'priority' at the top level,
  // but drizzle schema expects it inside the 'options' JSON blob if it's stored that way,
  // or as a separate column if the schema is designed like that.
  // The current schema.jobsTable.priority is a direct column.
  // So, we need to ensure 'priority' is correctly passed.
  // The 'options' field in JobPersistenceData is IJobOptions, which also contains 'priority'.
  // The drizzle schema's 'options' column stores the IJobOptions object.
  // The schema also has a separate 'priority' column.
  // This implies that 'priority' is stored denormalized in its own column for sorting/indexing,
  // and also within the 'options' JSON.

  // The spread `...data` will include the top-level `priority` from `JobPersistenceData`.
  // It will also include `options` (as IJobOptions).
  // This seems to align with how Drizzle would expect it if `jobsTable` has both
  // a `priority` column and an `options` JSON column.
  return {
    id: data.id,
    queueName: data.queueName,
    name: data.name,
    // This will be typed as P, Drizzle handles JSON stringification
    payload: data.payload,
    // This is IJobOptions, Drizzle handles JSON stringification
    options: data.options,
    // Explicitly pass top-level priority for the dedicated column
    priority: data.priority,
    status: data.status,
    attemptsMade: data.attemptsMade,
    // This is number | object, Drizzle handles JSON stringification
    progress: data.progress,
    // This is Array<{...timestamp: number}>, Drizzle handles JSON
    logs: data.logs,
    // This is R | null, Drizzle handles JSON
    returnValue: data.returnValue,
    failedReason: data.failedReason,
    stacktrace: data.stacktrace,
    // Convert timestamps back to Date objects for Drizzle
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
    processedOn: data.processedOn ? new Date(data.processedOn) : null,
    finishedOn: data.finishedOn ? new Date(data.finishedOn) : null,
    delayUntil: data.delayUntil ? new Date(data.delayUntil) : null,
    lockUntil: data.lockUntil ? new Date(data.lockUntil) : null,
  };
}
