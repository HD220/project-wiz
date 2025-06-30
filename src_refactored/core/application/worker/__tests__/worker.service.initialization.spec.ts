import { vi, describe, it, expect, beforeEach, afterEach, Mock } from 'vitest';

// eslint-disable-next-line boundaries/element-types -- Integration test needs access to infrastructure
import { DrizzleJobRepository } from '../../../../infrastructure/persistence/drizzle/job/drizzle-job.repository';
// eslint-disable-next-line boundaries/element-types -- Integration test needs access to infrastructure
import { TestDb, createTestDbClient, runMigrations } from '../../../../infrastructure/queue/drizzle/__tests__/test-db.helper';
// eslint-disable-next-line boundaries/element-types -- Integration test needs access to infrastructure
import { QueueService } from '../../../../infrastructure/queue/drizzle/queue.service';
import { JobEntity } from '../../../domain/job/job.entity';
import { WorkerService } from '../worker.service';

import {
  TestPayload, TestResult, QUEUE_NAME,
  defaultWorkerOptions, defaultJobOptions
} from './worker.service.spec.helper';

describe('WorkerService - Initialization', () => {
  let db: TestDb;
  let jobRepository: DrizzleJobRepository;
  let queueService: QueueService<TestPayload, TestResult>;
  let workerService: WorkerService<TestPayload, TestResult>;
  let mockProcessor: Mock<[JobEntity<TestPayload, TestResult>], Promise<TestResult>>;

  beforeEach(async () => {
    vi.useFakeTimers();
    db = createTestDbClient({ memory: true });
    await runMigrations(db);
    jobRepository = new DrizzleJobRepository(db);
    queueService = new QueueService<TestPayload, TestResult>(QUEUE_NAME, jobRepository, defaultJobOptions);
    mockProcessor = vi.fn();
    workerService = new WorkerService(queueService, mockProcessor, defaultWorkerOptions);
    vi.spyOn(workerService, 'emit');
  });

  afterEach(async () => {
    if (!workerService.isClosed) await workerService.close();
    if (queueService) await queueService.close();
    vi.clearAllMocks(); vi.restoreAllMocks(); vi.useRealTimers();
    if (db && typeof db.close === 'function') db.close();
  });

  it('should create a worker instance', () => {
    expect(workerService).toBeInstanceOf(WorkerService);
    expect(workerService.isClosed).toBe(false);
    expect(workerService.isRunning).toBe(false);
  });
});
