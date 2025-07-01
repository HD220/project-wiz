import { TargetAgentRoleVO } from "@/core/domain/agent/value-objects/target-agent-role.vo";
import { QueueError } from "@/core/domain/common/errors";
import { JobEntity } from "@/core/domain/job/job.entity";
import { JobIdVO } from "@/core/domain/job/value-objects/job-id.vo";

import { Result } from "@/shared/result";

export interface FailDetails {
  message: string;
  stack?: string;
  retryable?: boolean;
}

export interface IJobQueue {
  add(job: JobEntity): Promise<Result<JobEntity, QueueError>>;
  getNext(
    workerId: string,
    supportedRoles: TargetAgentRoleVO[]
  ): Promise<Result<JobEntity | null, QueueError>>;
  complete(
    jobId: JobIdVO,
    resultData?: unknown
  ): Promise<Result<void, QueueError>>;
  fail(
    jobId: JobIdVO,
    errorDetails: FailDetails,
    attempt: number
  ): Promise<Result<void, QueueError>>;
  delay(jobId: JobIdVO, delayUntil: Date): Promise<Result<void, QueueError>>;
  getJobById(jobId: JobIdVO): Promise<Result<JobEntity | null, QueueError>>;
}

export const IJobQueueToken = Symbol("IJobQueue");
