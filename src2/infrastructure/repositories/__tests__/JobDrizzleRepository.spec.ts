import { describe, it, expect, beforeEach } from 'vitest';
import { BetterSQLite3Database, drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { randomUUID } from 'crypto';

import { JobDrizzleRepository } from '../JobDrizzleRepository';
import { jobsTable, projectsTable, type NewJob, type Job, type NewProject, type Project } from '../../../core/domain/schemas';
import { eq } from 'drizzle-orm';

describe('JobDrizzleRepository', () => {
  let db: BetterSQLite3Database;
  let jobRepository: JobDrizzleRepository;
  let testProject: Project; // Usado para simular project_id no payload

  beforeEach(async () => {
    const sqlite = new Database(':memory:');
    db = drizzle(sqlite, { schema: { jobsTable, projectsTable } });
    migrate(db, { migrationsFolder: 'infrastructure/database/migrations' });
    jobRepository = new JobDrizzleRepository(db);

    const projectData: NewProject = {
      id: 'proj_' + randomUUID(),
      name: 'Test Project for Payloads',
      caminho_working_directory: './test-workdir',
    };
    const insertedProjects = await db.insert(projectsTable).values(projectData).returning();
    testProject = insertedProjects[0];
  });

  it('add(jobData) - deve inserir um novo Job e retorná-lo com IDs e timestamps', async () => {
    const jobData: NewJob = {
      name: 'Test Job Add',
      payload: { data: 'test payload', forProjectId: testProject.id }, // project_id agora no payload
      persona_id: 'persona_test_add'
    };

    const addedJob = await jobRepository.add(jobData);

    expect(addedJob).toBeDefined();
    expect(addedJob.id).toBeTypeOf('string');
    expect(addedJob.name).toBe(jobData.name);
    expect(addedJob.payload).toEqual({ data: 'test payload', forProjectId: testProject.id });
    expect(addedJob.status).toBe('pending');
    expect(addedJob.created_at).toBeInstanceOf(Date);
    expect(addedJob.updated_at).toBeInstanceOf(Date);

    const dbJob = await db.select().from(jobsTable).where(eq(jobsTable.id, addedJob.id)).get();
    expect(dbJob).toBeDefined();
    expect(dbJob?.name).toBe(jobData.name);
    expect(dbJob).not.toHaveProperty('project_id'); // Garantir que a coluna não existe mais no tipo
  });

  it('findById(id) - deve retornar o Job correto se o ID existir', async () => {
    const jobData: NewJob = { name: 'FindMe Job', payload: { forProjectId: testProject.id } };
    const addedJob = await jobRepository.add(jobData);

    const foundJob = await jobRepository.findById(addedJob.id);
    expect(foundJob).not.toBeNull();
    expect(foundJob?.id).toBe(addedJob.id);
    expect(foundJob?.name).toBe('FindMe Job');
    expect(foundJob).not.toHaveProperty('project_id');
  });

  it('findById(id) - deve retornar null se o ID não existir', async () => {
    const foundJob = await jobRepository.findById('non_existent_id');
    expect(foundJob).toBeNull();
  });

  it('update(jobId, data) - deve atualizar os campos especificados e updated_at', async () => {
    const jobData: NewJob = { name: 'Update Job Initial', status: 'pending' };
    const addedJob = await jobRepository.add(jobData);

    const updateData = { status: 'executing' as Job['status'], payload: { newData: 'updated' } };
    await new Promise(resolve => setTimeout(resolve, 10));

    const updatedJob = await jobRepository.update(addedJob.id, updateData);

    expect(updatedJob).not.toBeNull();
    expect(updatedJob?.status).toBe('executing');
    expect(updatedJob?.payload).toEqual({ newData: 'updated' });
    expect(updatedJob?.updated_at?.getTime()).toBeGreaterThan(addedJob.updated_at.getTime());
    expect(updatedJob).not.toHaveProperty('project_id');
  });

  it('update(jobId, data) - deve retornar null se o Job ID não existir', async () => {
    const updatedJob = await jobRepository.update('non_existent_id', { status: 'completed' });
    expect(updatedJob).toBeNull();
  });

  it('findPendingJobs - deve retornar jobs pending e delayed corretamente, respeitando a ordem', async () => {
    const now = new Date();
    await jobRepository.add({ name: 'Pending Job 1 (P2)', priority: 2, created_at: new Date(now.getTime() - 2000) });
    await jobRepository.add({ name: 'Pending Job 2 (P1)', priority: 1, created_at: new Date(now.getTime() - 1000) });
    await jobRepository.add({
      name: 'Delayed Job Ready (P0)',
      status: 'delayed',
      priority: 0,
    });
    await jobRepository.add({ name: 'Executing Job', status: 'executing' });

    const pendingJobs = await jobRepository.findPendingJobs({limit: 5});
    expect(pendingJobs.length).toBe(3);
    expect(pendingJobs[0].name).toBe('Delayed Job Ready (P0)');
    expect(pendingJobs[1].name).toBe('Pending Job 2 (P1)');
    expect(pendingJobs[2].name).toBe('Pending Job 1 (P2)');
    pendingJobs.forEach(job => expect(job).not.toHaveProperty('project_id'));
  });

  it('findPendingJobs - deve retornar um array vazio se não houver Jobs elegíveis', async () => {
    await jobRepository.add({ name: 'Executing Job', status: 'executing' });
    await jobRepository.add({ name: 'Completed Job', status: 'completed' });

    const pendingJobs = await jobRepository.findPendingJobs();
    expect(pendingJobs.length).toBe(0);
  });

  it('findJobsByIds - deve retornar os Jobs corretos', async () => {
    const job1 = await jobRepository.add({ name: 'Job 1 for Batch Find' });
    const job2 = await jobRepository.add({ name: 'Job 2 for Batch Find' });
    await jobRepository.add({ name: 'Job 3 Not in Batch' });

    const foundJobs = await jobRepository.findJobsByIds([job1.id, job2.id]);
    expect(foundJobs.length).toBe(2);
    expect(foundJobs.find(j => j.id === job1.id)).toBeDefined();
    expect(foundJobs.find(j => j.id === job2.id)).toBeDefined();
    foundJobs.forEach(job => expect(job).not.toHaveProperty('project_id'));
  });

  it('findJobsByIds - deve retornar array vazio se nenhum ID for encontrado ou array vazio for passado', async () => {
    expect(await jobRepository.findJobsByIds([])).toEqual([]);
    expect(await jobRepository.findJobsByIds(['non_existent_id_1', 'non_existent_id_2'])).toEqual([]);
  });
});
