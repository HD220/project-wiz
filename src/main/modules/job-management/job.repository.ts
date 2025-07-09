import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { JobEntity, JobEntityProps } from '@/core/domain/job/job.entity';
import { JobIdVO } from '@/core/domain/job/value-objects/job-id.vo';
import { jobs } from './job.schema';
import { eq } from 'drizzle-orm';

// TODO: Replace with actual database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

export class JobRepository {
  async create(job: JobEntity<any, any>): Promise<void> {
    const data = job.toPersistence();
    // Manually convert id to string as drizzle expects a string for UUIDs
    const dataWithStringId = { ...data, id: data.id.value };
    await db.insert(jobs).values(dataWithStringId);
  }

  async findById(id: JobIdVO): Promise<JobEntity<any, any> | null> {
    const result = await db.select().from(jobs).where(eq(jobs.id, id.value));
    if (result.length === 0) {
      return null;
    }
    // Manually convert id back to JobIdVO
    const jobProps = { ...result[0], id: new JobIdVO(result[0].id) } as JobEntityProps<any, any>;
    return JobEntity.fromPersistenceData(jobProps);
  }

  async update(job: JobEntity<any, any>): Promise<void> {
    const data = job.toPersistence();
    // Manually convert id to string as drizzle expects a string for UUIDs
    const dataWithStringId = { ...data, id: data.id.value };
    await db.update(jobs).set(dataWithStringId).where(eq(jobs.id, data.id.value));
  }

  async listAll(): Promise<JobEntity<any, any>[]> {
    const results = await db.select().from(jobs);
    // Manually convert id back to JobIdVO for each job
    return results.map(result => {
      const jobProps = { ...result, id: new JobIdVO(result.id) } as JobEntityProps<any, any>;
      return JobEntity.fromPersistenceData(jobProps);
    });
  }
}
