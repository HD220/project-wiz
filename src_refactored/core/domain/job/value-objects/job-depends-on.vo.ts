// src_refactored/core/domain/job/value-objects/job-depends-on.vo.ts
import { AbstractValueObject, ValueObjectProps } from '@/core/common/value-objects/base.vo';
import { JobIdVO } from './job-id.vo'; // This file will need to be created

export interface JobDependsOnProps extends ValueObjectProps {
  value: JobIdVO[]; // Array of JobIdVO instances
}

export class JobDependsOnVO extends AbstractValueObject<JobDependsOnProps> {
  private constructor(props: JobDependsOnProps) {
    // Ensure the array is deeply immutable if JobIdVOs are mutable (they shouldn't be)
    // For now, AbstractValueObject freezes `props`, and JobIdVO should be immutable.
    super(props);
  }

  public static create(jobIds: JobIdVO[] = []): JobDependsOnVO {
    // Ensure no duplicates for canonical representation, though AbstractValueObject.equals handles it by stringify
    const uniqueJobIds = jobIds.reduce((acc, current) => {
      if (!acc.find(item => item.equals(current))) {
        acc.push(current);
      }
      return acc;
    }, [] as JobIdVO[]);
    // Sort by ID value for consistent equality checks if AbstractValueObject.equals is not used.
    // However, with JSON.stringify in AbstractValueObject, order matters.
    // For simplicity and consistency, let's sort them.
    uniqueJobIds.sort((a, b) => a.value.localeCompare(b.value));
    return new JobDependsOnVO({ value: uniqueJobIds });
  }

  /**
   * Provides a copy of the JobIdVO array.
   */
  public get value(): ReadonlyArray<JobIdVO> {
    return [...this.props.value]; // Return a new array (shallow copy)
  }

  /**
   * Returns a new JobDependsOnVO with the added dependency.
   * If the dependency already exists, returns the current instance.
   */
  public addDependency(jobId: JobIdVO): JobDependsOnVO {
    if (this.props.value.some((id) => id.equals(jobId))) {
      return this;
    }
    const newJobIds = [...this.props.value, jobId];
    newJobIds.sort((a, b) => a.value.localeCompare(b.value)); // Maintain sort order
    return new JobDependsOnVO({ value: newJobIds });
  }

  /**
   * Returns a new JobDependsOnVO without the specified dependency.
   * If the dependency doesn't exist, returns the current instance.
   */
  public removeDependency(jobId: JobIdVO): JobDependsOnVO {
    const newJobIds = this.props.value.filter((id) => !id.equals(jobId));
    if (newJobIds.length === this.props.value.length) {
      return this;
    }
    // No need to re-sort as filter preserves order
    return new JobDependsOnVO({ value: newJobIds });
  }

  public hasDependencies(): boolean {
    return this.props.value.length > 0;
  }

  /**
   * Provides an array of the string values of the Job IDs.
   */
  public getJobIdStrings(): string[] {
    return this.props.value.map((jobIdVo) => jobIdVo.value);
  }

  // The .equals method is inherited from AbstractValueObject
  // It will perform a JSON.stringify comparison of the props.
  // For this to be reliable for an array of VOs, the VOs themselves must have
  // a consistent string representation (which JobIdVO should, if based on a string ID)
  // and the order of elements in the `value` array must be consistent.
  // The sorting in `create` and `addDependency` helps ensure this.
}
