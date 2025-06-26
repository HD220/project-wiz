import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { JobExecutionLogsVO } from './job-execution-logs.vo';
import { JobExecutionLogEntryVO, LogLevel } from './job-execution-log-entry.vo';

describe('JobExecutionLogsVO', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create an empty logs collection', () => {
    const logs = JobExecutionLogsVO.empty();
    expect(logs.entries).toEqual([]);
    expect(logs.count()).toBe(0);
  });

  it('should create with initial entries and sort them by timestamp', () => {
    const now = Date.now();
    const entry1 = JobExecutionLogEntryVO.create('Message 1', 'INFO', undefined, new Date(now));
    vi.advanceTimersByTime(10);
    const entry2 = JobExecutionLogEntryVO.create('Message 2', 'WARN', undefined, new Date(now + 10));
    vi.advanceTimersByTime(10);
    const entry3 = JobExecutionLogEntryVO.create('Message 0', 'DEBUG', undefined, new Date(now -10)); // earlier

    const logs = JobExecutionLogsVO.create([entry1, entry2, entry3]);
    expect(logs.count()).toBe(3);
    expect(logs.entries[0].message).toBe('Message 0'); // entry3 should be first
    expect(logs.entries[1].message).toBe('Message 1'); // entry1 should be second
    expect(logs.entries[2].message).toBe('Message 2'); // entry2 should be third
  });

  it('addEntry() should return a new VO with the added entry and maintain sort order', () => {
    const now = Date.now();
    const logs1 = JobExecutionLogsVO.empty();

    const entry1 = JobExecutionLogEntryVO.create('First log', 'INFO', undefined, new Date(now));
    vi.advanceTimersByTime(100);
    const entry2 = JobExecutionLogEntryVO.create('Second log', 'WARN', undefined, new Date(now + 100));

    const logs2 = logs1.addEntry(entry2); // Add later entry first
    expect(logs1.count()).toBe(0); // Original is immutable
    expect(logs2.count()).toBe(1);
    expect(logs2.entries[0]).toBe(entry2);

    const logs3 = logs2.addEntry(entry1); // Add earlier entry
    expect(logs2.count()).toBe(1); // Original is immutable
    expect(logs3.count()).toBe(2);
    expect(logs3.entries[0]).toBe(entry1); // entry1 (earlier) should be first
    expect(logs3.entries[1]).toBe(entry2); // entry2 (later) should be second
  });

  it('addLog() convenience method should add a new log entry correctly', () => {
    const logs1 = JobExecutionLogsVO.empty();
    const now = new Date();
    vi.setSystemTime(now);

    const logs2 = logs1.addLog('Test message', 'DEBUG', { data: 123 });
    expect(logs1.count()).toBe(0);
    expect(logs2.count()).toBe(1);
    expect(logs2.entries[0].message).toBe('Test message');
    expect(logs2.entries[0].level).toBe('DEBUG');
    expect(logs2.entries[0].details).toEqual({ data: 123 });
    expect(logs2.entries[0].timestamp.getTime()).toBe(now.getTime());
  });

  it('entries property should be a frozen array', () => {
    const logs = JobExecutionLogsVO.create([JobExecutionLogEntryVO.create('test')]);
    expect(Object.isFrozen(logs.entries)).toBe(true);
    // @ts-ignore
    expect(() => { logs.entries.push(JobExecutionLogEntryVO.create('another')); }).toThrow();
  });

  it('equals() should compare log collections correctly', () => {
    const entry1 = JobExecutionLogEntryVO.create('Log A');
    vi.advanceTimersByTime(10);
    const entry2 = JobExecutionLogEntryVO.create('Log B');

    const logsA1 = JobExecutionLogsVO.create([entry1, entry2]);
    const logsA2 = JobExecutionLogsVO.create([entry1, entry2]); // Same entries, same order
    const logsB = JobExecutionLogsVO.create([entry2, entry1]); // Same entries, different initial order (should be sorted same)
    const logsC = JobExecutionLogsVO.create([entry1]);

    expect(logsA1.equals(logsA2)).toBe(true);
    expect(logsA1.equals(logsB)).toBe(true); // Because internal array is sorted
    expect(logsA1.equals(logsC)).toBe(false);
  });
});
