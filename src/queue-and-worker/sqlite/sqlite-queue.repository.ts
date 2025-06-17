import { Database } from "better-sqlite3";
import { Job as JobInterface, JobStatus } from "../job/job.interface.js";
import { Job } from "../job/job.js";
import { Queue } from "../queue/queue.interface";

interface JobRow {
  id: string;
  data: string;
  attemptsMade: number;
  status: JobStatus;
  delay?: number;
  timestamp: number;
  processedOn?: number;
  finishedOn?: number;
  failedReason?: string;
  priority?: number;
}

export class SqliteQueueRepository<T = unknown> {
  constructor(private readonly db: Database) {
    this.setupDatabase();
  }

  private setupDatabase(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS jobs (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        attemptsMade INTEGER DEFAULT 0,
        status TEXT NOT NULL,
        delay INTEGER,
        timestamp INTEGER NOT NULL,
        processedOn INTEGER,
        finishedOn INTEGER,
        failedReason TEXT,
        priority INTEGER DEFAULT 0,
        progress INTEGER DEFAULT 0
      );
      
      CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
      CREATE INDEX IF NOT EXISTS idx_jobs_timestamp ON jobs(timestamp);
    `);
  }

  async addJob(job: Job<T>): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT INTO jobs (
        id, data, attemptsMade, status, delay, timestamp, priority, progress
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      job.id,
      JSON.stringify(job.data),
      job.attemptsMade,
      job.status,
      job.delay,
      job.timestamp,
      job.priority,
      job.getProgress()
    );
  }

  async getJob(id: string): Promise<Job<T> | null> {
    const stmt = this.db.prepare("SELECT * FROM jobs WHERE id = ?");
    const row = stmt.get(id) as JobRow | undefined;

    if (!row) return null;

    const job = new Job<T>(
      row.id,
      JSON.parse(row.data) as T,
      row.attemptsMade,
      row.status,
      row.delay,
      row.timestamp,
      row.processedOn,
      row.finishedOn,
      row.failedReason,
      row.priority
    );
    (job as any).repository = this;
    return job;
  }

  async getNextJob(): Promise<Job<T> | null> {
    const stmt = this.db.prepare(`
      SELECT * FROM jobs 
      WHERE status = 'waiting' OR (status = 'delayed' AND timestamp <= ?)
      ORDER BY priority DESC, timestamp ASC
      LIMIT 1
    `);

    const row = stmt.get(Date.now()) as JobRow | undefined;
    if (!row) return null;

    const job = new Job<T>(
      row.id,
      JSON.parse(row.data) as T,
      row.attemptsMade,
      row.status,
      row.delay,
      row.timestamp,
      row.processedOn,
      row.finishedOn,
      row.failedReason,
      row.priority
    );
    (job as any).repository = this;
    return job;
  }

  async updateJob(job: Job<T>): Promise<void> {
    const stmt = this.db.prepare(`
      UPDATE jobs SET
        attemptsMade = ?,
        status = ?,
        processedOn = ?,
        finishedOn = ?,
        failedReason = ?,
        progress = ?
      WHERE id = ?
    `);

    stmt.run(
      job.attemptsMade,
      job.status,
      job.processedOn,
      job.finishedOn,
      job.failedReason,
      job.getProgress(),
      job.id
    );
  }

  async updateJobProgress(id: string, progress: number): Promise<void> {
    const stmt = this.db.prepare(`
      UPDATE jobs SET
        progress = ?
      WHERE id = ?
    `);
    stmt.run(progress, id);
  }

  async getJobsByStatus(status: JobStatus): Promise<Job<T>[]> {
    const stmt = this.db.prepare("SELECT * FROM jobs WHERE status = ?");
    const rows = stmt.all(status) as JobRow[];

    return rows.map((row) => {
      const job = new Job<T>(
        row.id,
        JSON.parse(row.data) as T,
        row.attemptsMade,
        row.status,
        row.delay,
        row.timestamp,
        row.processedOn,
        row.finishedOn,
        row.failedReason,
        row.priority
      );
      (job as any).repository = this;
      return job;
    });
  }

  async clear(): Promise<void> {
    const stmt = this.db.prepare("DELETE FROM jobs");
    stmt.run();
  }
}
