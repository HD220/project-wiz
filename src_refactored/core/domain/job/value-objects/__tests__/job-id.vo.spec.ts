import { validate as uuidValidate, version as uuidVersion } from 'uuid';
import { describe, it, expect } from 'vitest';

import { JobIdVO } from '../job-id.vo';

describe('JobIdVO', () => {
  it('should create a JobIdVO with a valid UUID v4 if no id is provided', () => {
    const jobId = JobIdVO.create();
    expect(jobId).toBeInstanceOf(JobIdVO);
    expect(uuidValidate(jobId.value)).toBe(true);
    expect(uuidVersion(jobId.value)).toBe(4);
  });

  it('should create a JobIdVO with a provided valid UUID', () => {
    const validUuid = '7f6c6a90-4d8a-4f1e-9b0a-7b1d7e4c8a2b';
    const jobId = JobIdVO.create(validUuid);
    expect(jobId).toBeInstanceOf(JobIdVO);
    expect(jobId.value).toBe(validUuid);
  });

  it('should throw an error if a provided id is not a valid UUID', () => {
    const invalidUuid = 'invalid-uuid';
     expect(() => JobIdVO.create(invalidUuid)).toThrow('Invalid Job ID format (must be a valid UUID v4).'); // Corrected message
  });

  it('equals should return true for JobIdVOs with the same id', () => {
    const uuid = 'c1b2a3f4-1b2c-4d5e-8f6a-1b2c3d4e5f6a';
    const jobId1 = JobIdVO.create(uuid);
    const jobId2 = JobIdVO.create(uuid);
    expect(jobId1.equals(jobId2)).toBe(true);
  });

  it('equals should return false for JobIdVOs with different ids', () => {
    const jobId1 = JobIdVO.create();
    const jobId2 = JobIdVO.create();
    expect(jobId1.equals(jobId2)).toBe(false);
  });

  it('equals should return false when compared with null or undefined', () => {
    const jobId = JobIdVO.create();
    expect(jobId.equals(null)).toBe(false); // Removed 'as any'
    expect(jobId.equals(undefined)).toBe(false); // Removed 'as any'
  });

  it('should allow node:crypto.randomUUID() to be used if uuid library is not available (conceptual check)', () => {
    // This test is more about ensuring the VO doesn't strictly depend on the 'uuid' library's specific output
    // if node:crypto is the fallback or primary. Both generate valid UUIDs.
    const cryptoGeneratedId = JobIdVO.create(); // Uses node:crypto.randomUUID() internally
    expect(uuidValidate(cryptoGeneratedId.value)).toBe(true);
  });
});
