import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JobExecutionLogEntryVO, LogLevel } from './job-execution-log-entry.vo';
import { ValueError } from '../../../common/errors';

describe('JobExecutionLogEntryVO', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create a log entry with default level INFO and current timestamp', () => {
    const now = new Date();
    vi.setSystemTime(now);
    const entry = JobExecutionLogEntryVO.create('Test message');

    expect(entry.message).toBe('Test message');
    expect(entry.level).toBe('INFO');
    expect(entry.timestamp.getTime()).toBe(now.getTime());
    expect(entry.details).toBeUndefined();
  });

  it('should create a log entry with specified level, details, and timestamp', () => {
    const then = new Date(Date.now() - 10000);
    const details = { code: 123 };
    const entry = JobExecutionLogEntryVO.create('Error occurred', 'ERROR', details, then);

    expect(entry.message).toBe('Error occurred');
    expect(entry.level).toBe('ERROR');
    expect(entry.timestamp.getTime()).toBe(then.getTime());
    expect(entry.details).toEqual(details);
  });

  it('details object should be frozen', () => {
    const details = { data: 'mutable?' };
    const entry = JobExecutionLogEntryVO.create('Test', 'INFO', details);
    expect(Object.isFrozen(entry.details)).toBe(true);
    // @ts-ignore
    expect(() => { entry.details!.data = 'changed'; }).toThrow();
  });

  it('props object should be frozen', () => {
    const entry = JobExecutionLogEntryVO.create('Test');
    expect(Object.isFrozen(entry['props'])).toBe(true)
  });


  it('should throw ValueError if message is empty', () => {
    expect(() => JobExecutionLogEntryVO.create('')).toThrow(ValueError);
    expect(() => JobExecutionLogEntryVO.create('   ')).toThrow(ValueError);
  });

  it('should throw ValueError for invalid log level', () => {
    expect(() => JobExecutionLogEntryVO.create('Test message', 'INVALID' as any)).toThrow(ValueError);
  });

  it('toString() should format the log entry correctly', () => {
    const now = new Date();
    vi.setSystemTime(now);
    const entry1 = JobExecutionLogEntryVO.create('Simple log');
    expect(entry1.toString()).toBe(`[${now.toISOString()}] [INFO] Simple log`);

    const details = { code: 404, path: '/test' };
    const entry2 = JobExecutionLogEntryVO.create('Complex log', 'WARN', details, now);
    expect(entry2.toString()).toBe(`[${now.toISOString()}] [WARN] Complex log ${JSON.stringify(details)}`);
  });

  it('equals() should compare log entries correctly', () => {
    const now = new Date();
    vi.setSystemTime(now);

    const entry1 = JobExecutionLogEntryVO.create('Msg', 'INFO', { a: 1 });
    const entry2 = JobExecutionLogEntryVO.create('Msg', 'INFO', { a: 1 }); // Same timestamp due to fake timer
    const entry3 = JobExecutionLogEntryVO.create('Other Msg', 'INFO', { a: 1 });
    const entry4 = JobExecutionLogEntryVO.create('Msg', 'WARN', { a: 1 });
    const entry5 = JobExecutionLogEntryVO.create('Msg', 'INFO', { a: 2 });

    // Need to advance time slightly for different timestamp
    vi.advanceTimersByTime(100);
    const entry6 = JobExecutionLogEntryVO.create('Msg', 'INFO', { a: 1 });


    expect(entry1.equals(entry2)).toBe(true); // Same content and timestamp
    expect(entry1.equals(entry3)).toBe(false); // Different message
    expect(entry1.equals(entry4)).toBe(false); // Different level
    expect(entry1.equals(entry5)).toBe(false); // Different details
    expect(entry1.equals(entry6)).toBe(false); // Different timestamp
  });
});
