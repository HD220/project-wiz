import { describe, it, expect } from 'vitest';

import { ValueError } from '@/domain/common/errors';

import { JobProgressVO, JobProgressData } from './job-progress.vo';

describe('JobProgressVO', () => {
  it('should create with a valid percentage number', () => {
    const vo = JobProgressVO.create(50);
    expect(vo.value).toBe(50);
  });

  it('should create with a valid object', () => {
    const progressData: JobProgressData = { currentStep: 3, totalSteps: 5, message: 'Processing...' };
    const vo = JobProgressVO.create(progressData);
    expect(vo.value).toEqual(progressData);
  });

  it('initial() should create with 0 progress', () => {
    const vo = JobProgressVO.initial();
    expect(vo.value).toBe(0);
  });

  it('should throw ValueError for percentage less than 0', () => {
    expect(() => JobProgressVO.create(-10)).toThrow(ValueError);
  });

  it('should throw ValueError for percentage greater than 100', () => {
    expect(() => JobProgressVO.create(110)).toThrow(ValueError);
  });

  it('should throw ValueError for invalid type (not number or object)', () => {
    expect(() => JobProgressVO.create('invalid' as any)).toThrow(ValueError);
    expect(() => JobProgressVO.create(null as any)).toThrow(ValueError); // null is object but not desired here
  });

  it('value getter should return a copy for objects', () => {
    const originalData = { detail: 'some detail' };
    const vo = JobProgressVO.create(originalData);
    const value1 = vo.value as Record<string, any>;
    expect(value1).toEqual(originalData);

    // Modify the returned value
    value1.detail = 'changed detail';

    // The VO's internal state should not have changed
    const value2 = vo.value as Record<string, any>;
    expect(value2.detail).toBe('some detail');
  });

  it('equals() should compare progress correctly', () => {
    const p50_1 = JobProgressVO.create(50);
    const p50_2 = JobProgressVO.create(50);
    const p75 = JobProgressVO.create(75);
    const obj1 = JobProgressVO.create({ step: 1 });
    const obj2 = JobProgressVO.create({ step: 1 });
    const obj3 = JobProgressVO.create({ step: 2 });

    expect(p50_1.equals(p50_2)).toBe(true);
    expect(p50_1.equals(p75)).toBe(false);
    expect(obj1.equals(obj2)).toBe(true);
    expect(obj1.equals(obj3)).toBe(false);
    expect(p50_1.equals(obj1)).toBe(false);
  });
});
