import { JobId, JobStatus, JobName, JobPriority, JobAttempts, ActivityContext } from './value-objects';
// import { JobPayload } from './value-objects/job-payload.vo'; // Future
// import { JobResult } from './value-objects/job-result.vo'; // Future

export interface JobProps {
  id: JobId;
  name: JobName; // Descriptive name for the job/activity
  status: JobStatus;
  priority: JobPriority;
  attempts: JobAttempts;

  // payload: JobPayload; // Input data for the job - TBD more specific VO
  // result?: JobResult;  // Output data of the job - TBD more specific VO
  payload?: Record<string, any>; // Placeholder for now
  result?: Record<string, any>;  // Placeholder for now

  // ActivityContext stored in 'data' field as per ADR 001
  // For simplicity, making ActivityContext itself the 'data' field type
  // In a real scenario, 'data' might be a more generic JSON store,
  // and ActivityContext would be serialized into/from it.
  // For now, let's assume 'data' IS the ActivityContext.
  data: ActivityContext; // ADR 001: Job.data stores ActivityContext

  createdAt: Date;
  updatedAt: Date;
  executeAfter?: Date; // For delayed jobs
  dependsOn?: JobId[]; // Future: Dependencies
}

export class Job {
  private readonly props: JobProps;

  private constructor(props: JobProps) {
    this.props = props;
  }

  // Static factory method for creation
  public static create(
    initialProps: {
      name: JobName;
      priority: JobPriority;
      activityContext: ActivityContext;
      payload?: Record<string, any>;
      id?: JobId;
      status?: JobStatus;
      attempts?: JobAttempts;
      createdAt?: Date;
      updatedAt?: Date;
    }
  ): Job {
    const now = new Date();
    const props: JobProps = {
      id: initialProps.id || JobId.create(),
      name: initialProps.name,
      status: initialProps.status || JobStatus.pending(),
      priority: initialProps.priority,
      attempts: initialProps.attempts || JobAttempts.create(),
      payload: initialProps.payload || {},
      data: initialProps.activityContext,
      createdAt: initialProps.createdAt || now,
      updatedAt: initialProps.updatedAt || now,
    };
    return new Job(props);
  }

  // Accessors (Object Calisthenics: Rule 9 - No Getters/Setters for behavior, but ok for state exposure)
  public get id(): JobId { return this.props.id; }
  public get name(): JobName { return this.props.name; }
  public get status(): JobStatus { return this.props.status; }
  public get priority(): JobPriority { return this.props.priority; }
  public get attempts(): JobAttempts { return this.props.attempts; }
  public get payload(): Record<string, any> | undefined { return this.props.payload; }
  public get result(): Record<string, any> | undefined { return this.props.result; }
  public get data(): ActivityContext { return this.props.data; } // Exposes ActivityContext
  public get createdAt(): Date { return this.props.createdAt; }
  public get updatedAt(): Date { return this.props.updatedAt; }

  // Business methods would go here, e.g., for state transitions,
  // but ADRs and Clean Arch suggest this logic might live in Application Services.
  // For now, entity is mainly a state container.
  // Example of an update method that returns a new Job instance (immutability)
  public updateStatus(newStatus: JobStatus): Job {
    return new Job({ ...this.props, status: newStatus, updatedAt: new Date() });
  }

  public incrementAttempts(): Job {
    return new Job({ ...this.props, attempts: this.props.attempts.increment(), updatedAt: new Date() });
  }

  public updateActivityContext(newContext: ActivityContext): Job {
    return new Job({ ...this.props, data: newContext, updatedAt: new Date()});
  }

  public setResult(resultData: Record<string, any>): Job {
    return new Job({ ...this.props, result: resultData, status: JobStatus.completed(), updatedAt: new Date() });
  }
}
