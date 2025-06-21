import { IJobDefinitionService, CreateJobInput } from '../ports/job-definition-service.interface';
import { IQueueService, AddJobOptions } from '../ports/queue-service.interface';
import {
    Job,
    JobName,
    JobPriority,
    JobId,
    ActivityContext,
    ActivityType,
    ActivityHistory,
    ActivityHistoryEntry
} from '@/core/domain/entities/job';
// import { SystemClock } from '@/core/common/services/system-clock.interface'; // Assuming a clock port/service
import { ActivityTypeValue } from '@/core/domain/entities/job/value-objects/activity-type.vo';

// Assuming SystemClock interface and default implementation would be in a common place
interface SystemClock { now: () => Date; }
const defaultSystemClock: SystemClock = { now: () => new Date() };

export class JobDefinitionService implements IJobDefinitionService {
  constructor(
    private readonly queueService: IQueueService,
    private readonly systemClock: SystemClock = defaultSystemClock
  ) {}

  async createJob(input: CreateJobInput): Promise<Job> {
    const jobNameVo = JobName.create(input.jobName);

    // Create initial ActivityContext
    const initialHistoryEntry = ActivityHistoryEntry.create({
        timestamp: this.systemClock.now(),
        actor: 'system', // Or 'user' if initiated by user directly
        message: `Job '${input.jobName}' created with initial goal: ${input.initialGoal || 'Not specified'}.`
    });
    const initialHistory = ActivityHistory.create([initialHistoryEntry]);
    const activityTypeVo = ActivityType.create(input.activityType as ActivityTypeValue); // Add type assertion

    const activityContext = ActivityContext.create({
        type: activityTypeVo,
        history: initialHistory,
        currentGoal: input.initialGoal,
    });

    const options: AddJobOptions = {
      payload: input.payload,
      priority: input.priority !== undefined ? JobPriority.create(input.priority) : undefined,
      startAfter: input.startAfter,
      dependsOn: input.dependsOnJobIds?.map(idStr => JobId.fromString(idStr)),
    };

    // The addJob method in QueueService already handles creating JobId, setting defaults etc.
    return this.queueService.addJob(
      jobNameVo.getValue(), // QueueService.addJob takes string name
      activityContext,
      options
    );
  }
}
