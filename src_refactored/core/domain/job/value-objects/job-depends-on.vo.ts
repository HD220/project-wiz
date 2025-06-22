// src_refactored/core/domain/job/value-objects/job-depends-on.vo.ts
import { AbstractValueObject, ValueObjectProps } from '../../../../core/common/value-objects/base.vo';
import { JobId } from './job-id.vo';

interface JobDependsOnProps extends ValueObjectProps {
  jobIds: ReadonlyArray<JobId>;
}

export class JobDependsOn extends AbstractValueObject<JobDependsOnProps> {
  private constructor(jobIds: JobId[]) {
    super({ jobIds: Object.freeze([...jobIds]) });
  }

  public static create(jobIds: JobId[] = []): JobDependsOn {
    if (!Array.isArray(jobIds)) {
      throw new Error('JobIds must be an array to create JobDependsOn.');
    }
    if (jobIds.some(id => !(id instanceof JobId))) {
        throw new Error('All elements in jobIds array must be instances of JobId.');
    }
    // Could add validation for max number of dependencies, or check for circular dependencies (complex)
    return new JobDependsOn(jobIds);
  }

  public list(): ReadonlyArray<JobId> {
    return [...this.props.jobIds];
  }

  public addDependency(jobId: JobId): JobDependsOn {
    if (!(jobId instanceof JobId)) {
        throw new Error('Invalid JobId provided to addDependency.');
    }
    // Avoid duplicate dependencies
    if (this.props.jobIds.some(existingId => existingId.equals(jobId))) {
        return this; // Already exists, return current instance
    }
    const newJobIds = [...this.props.jobIds, jobId];
    return new JobDependsOn(newJobIds);
  }

  public count(): number {
    return this.props.jobIds.length;
  }

  public isEmpty(): boolean {
    return this.props.jobIds.length === 0;
  }

  // The base AbstractValueObject.equals using JSON.stringify will work if JobId.props is simple.
  // For a more robust comparison of JobId arrays:
  public equals(other?: JobDependsOn): boolean {
    if (!super.equals(other) || !(other instanceof JobDependsOn)) {
        return false;
    }
    if (this.props.jobIds.length !== other.props.jobIds.length) {
        return false;
    }
    // This assumes order matters. If order doesn't matter, sort before comparing or use set comparison.
    for (let i = 0; i < this.props.jobIds.length; i++) {
        if (!this.props.jobIds[i].equals(other.props.jobIds[i])) {
            return false;
        }
    }
    return true;
  }
}
