import { ActivityContext } from '@/core/domain/entities/job/value-objects/activity-context.vo';
import { JobStatus } from '@/core/domain/entities/job/value-objects/job-status.vo';

export interface ProcessActivityResult {
  status: 'completed' | 'failed' | 'in_progress' | 'waiting_for_dependency'; // Or use JobStatus values directly if they align
  newContext: ActivityContext;
  output?: Record<string, any>; // Any direct output from this processing step
  error?: string;
}
