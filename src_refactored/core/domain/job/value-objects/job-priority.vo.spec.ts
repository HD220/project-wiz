import { describe, it, expect } from 'vitest';
import { JobPriorityVO } from './job-priority.vo';
import { ValueError } from '../../../common/errors';

describe('JobPriorityVO', () => {
  it('should create a JobPriorityVO with a valid priority number', () => {
    const vo = JobPriorityVO.create(3);
    expect(vo.value).toBe(3);
  });

  it('should use default priority if no value is provided', () => {
    const vo = JobPriorityVO.create();
    expect(vo.value).toBe(5); // Default is 5
  });

  it('should use default priority if null is provided', () => {
    const vo = JobPriorityVO.create(null);
    expect(vo.value).toBe(5); // Default is 5
  });

  it('should throw ValueError for priority less than MIN_PRIORITY', () => {
    expect(() => JobPriorityVO.create(0)).toThrow(ValueError);
  });

  it('should throw ValueError for priority greater than MAX_PRIORITY', () => {
    expect(() => JobPriorityVO.create(11)).toThrow(ValueError);
  });

  it('should throw ValueError for non-integer priority', () => {
    expect(() => JobPriorityVO.create(3.5)).toThrow(ValueError);
  });

  it('static default() should return default priority', () => {
    expect(JobPriorityVO.default().value).toBe(5);
  });

  it('static highest() should return min priority value', () => {
    expect(JobPriorityVO.highest().value).toBe(1);
  });

  it('static lowest() should return max priority value', () => {
    expect(JobPriorityVO.lowest().value).toBe(10);
  });

  it('isHigherThan() should work correctly', () => {
    const p1 = JobPriorityVO.create(1); // Highest
    const p3 = JobPriorityVO.create(3);
    const p5 = JobPriorityVO.create(5); // Default

    expect(p1.isHigherThan(p3)).toBe(true);
    expect(p1.isHigherThan(p5)).toBe(true);
    expect(p3.isHigherThan(p5)).toBe(true);
    expect(p3.isHigherThan(p1)).toBe(false);
    expect(p5.isHigherThan(p1)).toBe(false);
    expect(p5.isHigherThan(p3)).toBe(false);
    expect(p3.isHigherThan(p3)).toBe(false); // Not higher than itself
  });

  it('equals() should compare priorities correctly', () => {
    const p3_1 = JobPriorityVO.create(3);
    const p3_2 = JobPriorityVO.create(3);
    const p5 = JobPriorityVO.create(5);

    expect(p3_1.equals(p3_2)).toBe(true);
    expect(p3_1.equals(p5)).toBe(false);
  });
});
