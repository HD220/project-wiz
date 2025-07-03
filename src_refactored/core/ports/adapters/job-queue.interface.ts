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

export interface IJobQueue {
  add(job: JobEntity): Promise<IUseCaseResponse<JobEntity, QueueError>>;
  getNext(
    workerId: string,
    supportedRoles: TargetAgentRoleVO[]
  ): Promise<IUseCaseResponse<JobEntity | null, QueueError>>;
  complete(
    jobId: JobIdVO,
    resultData?: unknown
  ): Promise<IUseCaseResponse<void, QueueError>>;
  fail(
    jobId: JobIdVO,
    errorDetails: FailDetails,
    attempt: number
  ): Promise<IUseCaseResponse<void, QueueError>>;
  delay(jobId: JobIdVO, delayUntil: Date): Promise<IUseCaseResponse<void, QueueError>>;
  getJobById(jobId: JobIdVO): Promise<IUseCaseResponse<JobEntity | null, QueueError>>;
}

export const IJobQueueToken = Symbol("IJobQueue");
