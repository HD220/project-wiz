import { JobStatus, JobStatusValue } from './job-status.vo';

describe('JobStatus Value Object', () => {
  it('should create a JobStatus instance for each valid static factory method', () => {
    expect(JobStatus.pending().getValue()).toBe('pending');
    expect(JobStatus.waiting().getValue()).toBe('waiting');
    expect(JobStatus.active().getValue()).toBe('active');
    expect(JobStatus.delayed().getValue()).toBe('delayed');
    expect(JobStatus.completed().getValue()).toBe('completed');
    expect(JobStatus.failed().getValue()).toBe('failed');
    expect(JobStatus.cancelled().getValue()).toBe('cancelled');
  });

  it('should create a JobStatus instance with JobStatus.create for valid status', () => {
    const statusValue: JobStatusValue = 'pending';
    const jobStatus = JobStatus.create(statusValue);
    expect(jobStatus.getValue()).toBe(statusValue);
  });

  it('should throw an error if an invalid status string is provided to create', () => {
    expect(() => JobStatus.create('invalid-status' as JobStatusValue)).toThrow('Invalid job status: invalid-status');
  });

  it('should correctly compare two JobStatus instances', () => {
    const status1 = JobStatus.pending();
    const status2 = JobStatus.pending();
    const status3 = JobStatus.active();

    expect(status1.equals(status2)).toBe(true);
    expect(status1.equals(status3)).toBe(false);
    expect(status1.equals(null as any)).toBe(false);
  });

  it('should correctly report its state via is... methods', () => {
    const pendingStatus = JobStatus.pending();
    expect(pendingStatus.isPending()).toBe(true);
    expect(pendingStatus.isActive()).toBe(false);

    const activeStatus = JobStatus.active();
    expect(activeStatus.isPending()).toBe(false);
    expect(activeStatus.isActive()).toBe(true);
    // Add more checks for other is... methods as needed
    expect(JobStatus.delayed().isDelayed()).toBe(true);
    expect(JobStatus.completed().isCompleted()).toBe(true);
    expect(JobStatus.failed().isFailed()).toBe(true);
    expect(JobStatus.cancelled().isCancelled()).toBe(true);
  });
});
