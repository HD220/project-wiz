import { describe, it, expect } from 'vitest';

import { ValueError } from '@/domain/common/errors';

import { JobIdVO } from './job-id.vo';

describe('JobIdVO', () => {
  it('should create a JobIdVO with a valid UUID', () => {
    const uuid = 'a1b2c3d4-e5f6-7777-8888-999a0b1c2d3e'; // Valid v7-like UUID (using 7 as version for example)
    const vo = JobIdVO.create(uuid);
    expect(vo.value).toBe(uuid);
  });

  it('should generate a valid UUID if no value is provided', () => {
    const vo = JobIdVO.generate();
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    expect(uuidRegex.test(vo.value)).toBe(true);
  });

  it('should also accept undefined to generate()', () => {
    const vo = JobIdVO.create(undefined);
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    expect(uuidRegex.test(vo.value)).toBe(true);
  });

  it('should throw ValueError for an invalid UUID format', () => {
    expect(() => JobIdVO.create('invalid-uuid')).toThrow(ValueError);
    expect(() => JobIdVO.create('a1b2c3d4-e5f6-777-888-999a0b1c2d3e')).toThrow(ValueError); // Incorrect segment lengths
  });

  it('should correctly compare two JobIdVO instances', () => {
    const uuid = 'a1b2c3d4-e5f6-7777-8888-999a0b1c2d3e';
    const vo1 = JobIdVO.create(uuid);
    const vo2 = JobIdVO.create(uuid);
    const vo3 = JobIdVO.generate();

    expect(vo1.equals(vo2)).toBe(true);
    expect(vo1.equals(vo3)).toBe(false);
    expect(vo1.equals(null as any)).toBe(false);
    expect(vo1.equals(undefined as any)).toBe(false);
  });
});
