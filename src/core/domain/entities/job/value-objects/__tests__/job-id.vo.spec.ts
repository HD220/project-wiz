import { JobId } from './job-id.vo';

describe('JobId Value Object', () => {
  it('should create a JobId with a random UUID if no id is provided', () => {
    const jobId = JobId.create();
    expect(jobId.getValue()).toMatch(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/);
  });

  it('should create a JobId with a provided valid UUID', () => {
    const uuid = 'a1b2c3d4-e5f6-7890-1234-567890abcdef';
    const jobId = JobId.create(uuid);
    expect(jobId.getValue()).toBe(uuid);
  });

  it('should create a JobId from a string', () => {
    const uuid = 'f1e2d3c4-b5a6-0987-6543-210987fedcba';
    const jobId = JobId.fromString(uuid);
    expect(jobId.getValue()).toBe(uuid);
  });

  it('should throw an error if an invalid UUID is provided to create', () => {
    expect(() => JobId.create('invalid-uuid')).toThrow('Invalid JobId format.');
  });

  it('should throw an error if an invalid UUID is provided to fromString', () => {
    expect(() => JobId.fromString('invalid-uuid-again')).toThrow('Invalid JobId format.');
  });

  it('should correctly compare two JobId instances', () => {
    const uuid = 'c1d2e3f4-a5b6-c7d8-e9f0-a1b2c3d4e5f6';
    const jobId1 = JobId.create(uuid);
    const jobId2 = JobId.create(uuid);
    const jobId3 = JobId.create(); // Different UUID

    expect(jobId1.equals(jobId2)).toBe(true);
    expect(jobId1.equals(jobId3)).toBe(false);
    expect(jobId1.equals(null as any)).toBe(false); // Test against null/undefined
  });
});
