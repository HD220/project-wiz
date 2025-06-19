import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BetterSQLite3Database, drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { randomUUID } from 'crypto';

import { JobDrizzleRepository } from './JobDrizzleRepository';
import { jobsTable, projectsTable, type NewJob, type Job, type NewProject } from '../../core/domain/schemas';
import { eq } from 'drizzle-orm';

describe('JobDrizzleRepository', () => {
  let db: BetterSQLite3Database;
  let jobRepository: JobDrizzleRepository;
  let testProject: Project; // Alterado para Project para ter o objeto completo

  beforeEach(async () => {
    const sqlite = new Database(':memory:');
    db = drizzle(sqlite, { schema: { jobsTable, projectsTable } });
    migrate(db, { migrationsFolder: 'infrastructure/database/migrations' });
    jobRepository = new JobDrizzleRepository(db);

    const projectData: NewProject = {
      id: 'proj_' + randomUUID(),
      name: 'Test Project',
      caminho_working_directory: './test-workdir',
    };
    const insertedProjects = await db.insert(projectsTable).values(projectData).returning();
    testProject = insertedProjects[0];
  });

  // afterEach não é estritamente necessário para :memory: db se recriado a cada teste.

  it('add(jobData) - deve inserir um Job com project_id', async () => {
    const jobData: NewJob = {
      name: 'Test Job With Project',
      project_id: testProject.id, // Usar o ID do projeto criado
      payload: { data: 'test payload' },
      persona_id: 'persona_test_add_with_project'
    };
    const addedJob = await jobRepository.add(jobData);
    expect(addedJob.project_id).toBe(testProject.id);
    expect(addedJob.name).toBe(jobData.name);
  });

  it('add(jobData) - deve inserir um Job sem project_id (null)', async () => {
    const jobData: NewJob = {
      name: 'Test Job Without Project (null)',
      project_id: null, // Explicitamente nulo
      payload: { data: 'test payload no project' },
      persona_id: 'persona_test_add_no_project_null'
    };
    const addedJob = await jobRepository.add(jobData);
    expect(addedJob.project_id).toBeNull();
    expect(addedJob.name).toBe(jobData.name);

    const dbJob = await db.select().from(jobsTable).where(eq(jobsTable.id, addedJob.id)).get();
    expect(dbJob?.project_id).toBeNull();
  });

  it('add(jobData) - deve inserir um Job sem project_id (undefined)', async () => {
    const jobData: NewJob = {
      name: 'Test Job Without Project (undefined)',
      // project_id é omitido, então será undefined
      payload: { data: 'test payload no project undefined' },
      persona_id: 'persona_test_add_no_project_undefined'
    };
    const addedJob = await jobRepository.add(jobData);
    // Drizzle geralmente insere NULL se o campo é undefined e a coluna é nullable
    expect(addedJob.project_id).toBeNull();
    expect(addedJob.name).toBe(jobData.name);

    const dbJob = await db.select().from(jobsTable).where(eq(jobsTable.id, addedJob.id)).get();
    expect(dbJob?.project_id).toBeNull();
  });


  it('findById(id) - deve retornar o Job correto se o ID existir', async () => {
    const jobData: NewJob = { name: 'FindMe Job', project_id: testProject.id };
    const addedJob = await jobRepository.add(jobData);
    const foundJob = await jobRepository.findById(addedJob.id);
    expect(foundJob).not.toBeNull();
    expect(foundJob?.id).toBe(addedJob.id);
    expect(foundJob?.name).toBe('FindMe Job');
  });

  it('findById(id) - deve retornar null se o ID não existir', async () => {
    const foundJob = await jobRepository.findById('non_existent_id');
    expect(foundJob).toBeNull();
  });

  it('update(jobId, data) - deve atualizar os campos especificados e updated_at', async () => {
    const jobData: NewJob = { name: 'Update Job Initial', project_id: testProject.id, status: 'pending' };
    const addedJob = await jobRepository.add(jobData);

    const updateData = { status: 'executing' as Job['status'], payload: { newData: 'updated' } };
    await new Promise(resolve => setTimeout(resolve, 10));

    const updatedJob = await jobRepository.update(addedJob.id, updateData);
    expect(updatedJob).not.toBeNull();
    expect(updatedJob?.status).toBe('executing');
    expect(updatedJob?.payload).toEqual({ newData: 'updated' });
    expect(updatedJob?.updated_at?.getTime()).toBeGreaterThan(addedJob.updated_at.getTime());
  });

  it('update(jobId, data) - deve poder setar project_id para null em um job existente', async () => {
    const jobData: NewJob = { name: 'Job to make projectless', project_id: testProject.id };
    const addedJob = await jobRepository.add(jobData);
    expect(addedJob.project_id).toBe(testProject.id);

    const updatedJob = await jobRepository.update(addedJob.id, { project_id: null });
    expect(updatedJob).not.toBeNull();
    expect(updatedJob?.project_id).toBeNull();
  });

  it('update(jobId, data) - deve retornar null se o Job ID não existir', async () => {
    const updatedJob = await jobRepository.update('non_existent_id', { status: 'completed' });
    expect(updatedJob).toBeNull();
  });

  it('findPendingJobs - deve retornar jobs pending e delayed corretamente, respeitando a ordem', async () => {
    const now = new Date();
    await jobRepository.add({ name: 'Pending Job 1 (P2)', project_id: testProject.id, priority: 2, created_at: new Date(now.getTime() - 2000) });
    await jobRepository.add({ name: 'Pending Job 2 (P1)', project_id: testProject.id, priority: 1, created_at: new Date(now.getTime() - 1000) });
    await jobRepository.add({
      name: 'Delayed Job Ready (P0)',
      project_id: testProject.id,
      status: 'delayed',
      priority: 0,
    });
    await jobRepository.add({ name: 'Executing Job', project_id: testProject.id, status: 'executing' });
    await jobRepository.add({ name: 'Pending Job No Project (P1)', priority: 1, created_at: new Date(now.getTime() - 1500) });

    const pendingJobs = await jobRepository.findPendingJobs({limit: 5});
    // Esperado: Delayed P0, Pending P1 (Job 2), Pending P1 (No Proj), Pending P2
    expect(pendingJobs.length).toBe(4); // 3 com project_id + 1 sem project_id
    expect(pendingJobs[0].name).toBe('Delayed Job Ready (P0)');
    // A ordem entre os dois P1 depende do created_at
    const p1Jobs = pendingJobs.filter(j => j.priority === 1).sort((a,b) => a.created_at.getTime() - b.created_at.getTime());
    expect(p1Jobs[0].name).toBe('Pending Job No Project (P1)');
    expect(p1Jobs[1].name).toBe('Pending Job 2 (P1)');
    expect(pendingJobs.find(j => j.name === 'Pending Job 1 (P2)')).toBeDefined();
  });

  it('findPendingJobs - deve retornar um array vazio se não houver Jobs elegíveis', async () => {
    await jobRepository.add({ name: 'Executing Job', project_id: testProject.id, status: 'executing' });
    await jobRepository.add({ name: 'Completed Job', project_id: testProject.id, status: 'completed' });

    const pendingJobs = await jobRepository.findPendingJobs();
    expect(pendingJobs.length).toBe(0);
  });

  it('findJobsByIds - deve retornar os Jobs corretos', async () => {
    const job1 = await jobRepository.add({ name: 'Job 1 for Batch Find', project_id: testProject.id });
    const job2 = await jobRepository.add({ name: 'Job 2 for Batch Find (No Proj)' });
    await jobRepository.add({ name: 'Job 3 Not in Batch', project_id: testProject.id });

    const foundJobs = await jobRepository.findJobsByIds([job1.id, job2.id]);
    expect(foundJobs.length).toBe(2);
    expect(foundJobs.find(j => j.id === job1.id)).toBeDefined();
    expect(foundJobs.find(j => j.id === job2.id)).toBeDefined();
    expect(foundJobs.find(j => j.id === job2.id)?.project_id).toBeNull();
  });

  it('findJobsByIds - deve retornar array vazio se nenhum ID for encontrado ou array vazio for passado', async () => {
    expect(await jobRepository.findJobsByIds([])).toEqual([]);
    expect(await jobRepository.findJobsByIds(['non_existent_id_1', 'non_existent_id_2'])).toEqual([]);
  });
});
