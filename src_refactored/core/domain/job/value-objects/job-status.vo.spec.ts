import { describe, it, expect } from 'vitest';

import { ValueError } from '@/domain/common/errors';

import { JobStatusVO, JobStatusEnum } from './job-status.vo';

describe('JobStatusVO', () => {
  it('should create a JobStatusVO with a valid status string', () => {
    const vo = JobStatusVO.create('PENDING');
    expect(vo.value).toBe(JobStatusEnum.PENDING);
  });

  it('should create a JobStatusVO with a valid status enum value', () => {
    const vo = JobStatusVO.create(JobStatusEnum.ACTIVE);
    expect(vo.value).toBe(JobStatusEnum.ACTIVE);
  });

  it('should be case-insensitive for string input', () => {
    const vo = JobStatusVO.create('pending');
    expect(vo.value).toBe(JobStatusEnum.PENDING);
  });

  it('should throw ValueError for an invalid status string', () => {
    expect(() => JobStatusVO.create('INVALID_STATUS')).toThrow(ValueError);
  });

  it('should correctly identify terminal statuses', () => {
    expect(JobStatusVO.completed().isTerminal()).toBe(true);
    expect(JobStatusVO.failed().isTerminal()).toBe(true);
    expect(JobStatusVO.pending().isTerminal()).toBe(false);
    expect(JobStatusVO.active().isTerminal()).toBe(false);
    expect(JobStatusVO.delayed().isTerminal()).toBe(false);
    expect(JobStatusVO.waitingChildren().isTerminal()).toBe(false);
  });

  it('should correctly identify processable statuses', () => {
    expect(JobStatusVO.pending().isProcessable()).toBe(true);
    expect(JobStatusVO.active().isProcessable()).toBe(false); // Active means it's already being processed
    expect(JobStatusVO.completed().isProcessable()).toBe(false);
    expect(JobStatusVO.failed().isProcessable()).toBe(false);
    expect(JobStatusVO.delayed().isProcessable()).toBe(false); // Needs promotion by scheduler
    expect(JobStatusVO.waitingChildren().isProcessable()).toBe(false); // Needs deps met
  });

  it('should use static factory methods correctly', () => {
    expect(JobStatusVO.pending().value).toBe(JobStatusEnum.PENDING);
    expect(JobStatusVO.active().value).toBe(JobStatusEnum.ACTIVE);
    expect(JobStatusVO.completed().value).toBe(JobStatusEnum.COMPLETED);
    expect(JobStatusVO.failed().value).toBe(JobStatusEnum.FAILED);
    expect(JobStatusVO.delayed().value).toBe(JobStatusEnum.DELAYED);
    expect(JobStatusVO.waitingChildren().value).toBe(JobStatusEnum.WAITING_CHILDREN);
  });

  it('should compare two JobStatusVO instances correctly', () => {
    const pending1 = JobStatusVO.pending();
    const pending2 = JobStatusVO.create('PENDING');
    const active = JobStatusVO.active();

    expect(pending1.equals(pending2)).toBe(true);
    expect(pending1.equals(active)).toBe(false);
  });

  it('is() method should work correctly', () => {
    const pending = JobStatusVO.pending();
    expect(pending.is(JobStatusEnum.PENDING)).toBe(true);
    expect(pending.is(JobStatusEnum.ACTIVE)).toBe(false);
  });
});
