import { Job, JobName, JobPriority, ActivityContext, ActivityType } from '@/core/domain/entities/job';
import { AddJobOptions } from './queue-service.interface'; // Re-use options from QueueService

// More specific input DTO for creating a job
export interface CreateJobInput {
  jobName: string; // Will be converted to JobName VO
  activityType: string; // ActivityTypeValue, will be converted to ActivityType VO
  initialGoal?: string; // For the ActivityContext
  payload?: Record<string, any>;
  priority?: number; // Will be converted to JobPriority VO
  startAfter?: Date;
  dependsOnJobIds?: string[]; // Array of JobId strings
}

export interface IJobDefinitionService {
  createJob(input: CreateJobInput): Promise<Job>;
}
