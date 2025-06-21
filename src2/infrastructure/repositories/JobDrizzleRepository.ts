import { type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { eq, and, or, asc, notInArray, inArray } from 'drizzle-orm';
import type { IJobRepository } from '../../core/application/ports/IJobRepository';
import type { Job, NewJob } from '../../core/domain/schemas';
import { jobsTable } from '../../core/domain/schemas';

export class JobDrizzleRepository implements IJobRepository {
  private db: BetterSQLite3Database;

  constructor(dbInstance: BetterSQLite3Database) {
    this.db = dbInstance;
  }

  async add(jobData: NewJob): Promise<Job> {
    console.log('[JobRepo] Adicionando Job:', jobData);
    const newJobs = await this.db.insert(jobsTable).values(jobData).returning();
    if (newJobs.length === 0) {
        throw new Error("Falha ao adicionar Job, nenhum resultado retornado.");
    }
    console.log('[JobRepo] Job adicionado:', newJobs[0]);
    return newJobs[0];
  }

  async findById(id: string): Promise<Job | null> {
    console.log('[JobRepo] Buscando Job por ID:', id);
    const result = await this.db.select().from(jobsTable).where(eq(jobsTable.id, id)).limit(1);
    return result.length ? result[0] : null;
  }

  async findPendingJobs(criteria?: {
    personaId?: string;
    excludedIds?: string[];
    limit?: number;
  }): Promise<Job[]> {
    console.log('[JobRepo] Buscando Jobs Pendentes, critérios:', criteria);
    const conditions = [
      or(
        eq(jobsTable.status, 'pending'),
        eq(jobsTable.status, 'delayed')
      )
    ];

    if (criteria?.personaId) {
      conditions.push(eq(jobsTable.persona_id, criteria.personaId));
    }

    if (criteria?.excludedIds && criteria.excludedIds.length > 0) {
      conditions.push(notInArray(jobsTable.id, criteria.excludedIds));
    }

    const query = this.db.select()
      .from(jobsTable)
      .where(and(...conditions))
      .orderBy(asc(jobsTable.priority), asc(jobsTable.created_at))
      .limit(criteria?.limit ?? 10);

    const results = await query;
    console.log(`[JobRepo] Jobs pendentes encontrados: ${results.length}`);
    return results;
  }

  async findJobsByIds(ids: string[]): Promise<Job[]> {
    if (ids.length === 0) return [];
    console.log('[JobRepo] Buscando Jobs por IDs:', ids);
    return this.db.select().from(jobsTable).where(inArray(jobsTable.id, ids));
  }

  async update(jobId: string, data: Partial<Omit<Job, 'id' | 'created_at'>>): Promise<Job | null> {
    console.log('[JobRepo] Atualizando Job:', jobId, 'com dados:', data);
    const jobToUpdate = { ...data, updated_at: new Date() } as Record<string, any>;

    for (const key in jobToUpdate) {
      if (jobToUpdate[key] === undefined) {
        delete jobToUpdate[key];
      }
    }

    const updatedJobs = await this.db.update(jobsTable)
      .set(jobToUpdate)
      .where(eq(jobsTable.id, jobId))
      .returning();

    if (updatedJobs.length === 0) {
        console.warn('[JobRepo] Falha ao atualizar Job, nenhum resultado retornado para ID:', jobId);
        return null;
    }
    console.log('[JobRepo] Job atualizado:', updatedJobs[0]);
    return updatedJobs[0];
  }
}
