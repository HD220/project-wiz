import { TargetAgentRoleVO } from "@/core/domain/agent/value-objects/target-agent-role.vo";
import { QueueError } from "@/core/domain/common/errors";
import { JobEntity } from "@/core/domain/job/job.entity";
import { JobIdVO } from "@/core/domain/job/value-objects/job-id.vo";

import { IUseCaseResponse } from "@/shared/application/use-case-response.dto";

export interface FailDetails {
  message: string;
  stack?: string;
  retryable?: boolean;
}

export interface IJobQueue<P extends { userId?: string }, R> {
  add(job: JobEntity<P, R>): Promise<IUseCaseResponse<JobEntity<P, R>, QueueError>>;
  getNext(
    workerId: string,
    supportedRoles: TargetAgentRoleVO[]
  ): Promise<IUseCaseResponse<JobEntity<P, R> | null, QueueError>>;
  complete(
    jobId: JobIdVO,
    resultData?: R
  ): Promise<IUseCaseResponse<void, QueueError>>;
  fail(
    jobId: JobIdVO,
    errorDetails: FailDetails,
    attempt: number
  ): Promise<IUseCaseResponse<void, QueueError>>;
  delay(jobId: JobIdVO, delayUntil: Date): Promise<IUseCaseResponse<void, QueueError>>;
  getJobById(jobId: JobIdVO): Promise<IUseCaseResponse<JobEntity<P, R> | null, QueueError>>;
}

export const IJobQueueToken = Symbol("IJobQueue");
