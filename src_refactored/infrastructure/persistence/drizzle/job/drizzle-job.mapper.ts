import { JobStatus } from "@/core/domain/job/job.entity";
import {
  IJobOptions,
  JobPersistenceData,
} from "@/core/domain/job/job.types";
import { JobPersistence } from "@/core/domain/job/job.entity";
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

export function mapToDrizzleInput(
  data: JobPersistence
): typeof schema.jobsTable.$inferInsert {
  return {
    ...data,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
    processedOn: data.processedOn ? new Date(data.processedOn) : null,
    finishedOn: data.finishedOn ? new Date(data.finishedOn) : null,
    delayUntil: data.delayUntil ? new Date(data.delayUntil) : null,
    lockUntil: data.lockUntil ? new Date(data.lockUntil) : null,
  };
}
