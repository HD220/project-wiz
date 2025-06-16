import { Database } from "better-sqlite3";
import { JobData, JobState } from "../job/job.interface";
import { JobRepository } from "../repository/job.repository.interface";
import { Job } from "../job/job";

export class SqliteJobRepository<T = unknown> implements JobRepository<T> {
  constructor(private readonly db: Database) {
    this.setupDatabase();
  }

  private setupDatabase(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS jobs (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        attempts INTEGER DEFAULT 0,
        max_attempts INTEGER DEFAULT 3,
        status TEXT NOT NULL,
        delay INTEGER,
        created_at INTEGER NOT NULL,
        processed_at INTEGER,
        completed_at INTEGER,
        failed_reason TEXT,
        priority INTEGER DEFAULT 0,
        progress INTEGER DEFAULT 0
      );
      
      CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
      CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at);
    `);
  }

  async save(job: Job<T>): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO jobs (
        id, data, attempts, max_attempts, status, delay, 
        created_at, processed_at, completed_at, failed_reason, priority, progress
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      job.id,
      JSON.stringify(job.data.payload),
      job.data.attempts,
      job.data.maxAttempts,
      job.state.status,
      job.state.delay,
      job.data.createdAt,
      job.state.processedAt,
      job.state.completedAt,
      job.state.failedReason,
      job.data.priority,
      job.state.progress
    );
  }

  async getById(id: string): Promise<Job<T> | null> {
    const stmt = this.db.prepare("SELECT * FROM jobs WHERE id = ?");
    const row = stmt.get(id);
    return row ? this.mapRowToJob(row) : null;
  }

  async getNextJob(): Promise<Job<T> | null> {
    const stmt = this.db.prepare(`
      SELECT * FROM jobs 
      WHERE status = 'waiting' OR (status = 'delayed' AND created_at <= ?)
      ORDER BY priority DESC, created_at ASC
      LIMIT 1
    `);
    const row = stmt.get(Date.now());
    return row ? this.mapRowToJob(row) : null;
  }

  async getJobsByStatus(status: JobState["status"]): Promise<Job<T>[]> {
    const stmt = this.db.prepare("SELECT * FROM jobs WHERE status = ?");
    const rows = stmt.all(status);
    return rows.map((row) => this.mapRowToJob(row));
  }

  async update(id: string, state: JobState): Promise<void> {
    const stmt = this.db.prepare(`
      UPDATE jobs SET
        status = ?,
        processed_at = ?,
        completed_at = ?,
        failed_reason = ?,
        delay = ?,
        progress = ?
      WHERE id = ?
    `);

    stmt.run(
      state.status,
      state.processedAt,
      state.completedAt,
      state.failedReason,
      state.delay,
      state.progress,
      id
    );
  }

  async clear(): Promise<void> {
    const stmt = this.db.prepare("DELETE FROM jobs");
    stmt.run();
  }

  private mapRowToJob(row: any): Job<T> {
    const jobData: JobData<T> = {
      id: row.id,
      payload: JSON.parse(row.data),
      attempts: row.attempts,
      maxAttempts: row.max_attempts,
      createdAt: row.created_at,
      priority: row.priority,
    };

    const jobState: JobState = {
      status: row.status,
      delay: row.delay,
      processedAt: row.processed_at,
      completedAt: row.completed_at,
      failedReason: row.failed_reason,
      progress: row.progress,
    };

    return new Job(this, jobData, jobState);
  }
}
