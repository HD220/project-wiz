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
  let testProject: NewProject;

  beforeEach(async () => {
    // Configurar banco de dados SQLite em memória para cada teste
    const sqlite = new Database(':memory:');
    db = drizzle(sqlite, { schema: { jobsTable, projectsTable } }); // Importante passar o schema aqui

    // Aplicar migrações
    // As migrações estão em infrastructure/database/migrations
    // O path para o migrator deve ser relativo ao cwd do teste ou absoluto.
    // Em Vitest, o cwd é geralmente a raiz do projeto (src2/).
    migrate(db, { migrationsFolder: 'infrastructure/database/migrations' });

    jobRepository = new JobDrizzleRepository(db); // Passar a instância do DB para o repo

    // Criar um projeto padrão para FK
    const projectData: NewProject = {
      id: 'proj_' + randomUUID(),
      name: 'Test Project',
      caminho_working_directory: './test-workdir',
    };
    await db.insert(projectsTable).values(projectData).returning();
    testProject = projectData;
  });

  afterEach(() => {
    // O banco de dados em memória é descartado automaticamente ao fechar a conexão,
    // mas se fosse um arquivo, limparíamos aqui.
    // Para ':memory:', não há muito o que fazer no afterEach individual para limpeza de tabelas
    // já que cada beforeEach cria um novo.
  });

  it('add(jobData) - deve inserir um novo Job e retorná-lo com IDs e timestamps', async () => {
    const jobData: NewJob = {
      name: 'Test Job Add',
      project_id: testProject.id!,
      payload: { data: 'test payload' },
      persona_id: 'persona_test_add'
    };

    const addedJob = await jobRepository.add(jobData);

    expect(addedJob).toBeDefined();
    expect(addedJob.id).toBeTypeOf('string');
    expect(addedJob.name).toBe(jobData.name);
    expect(addedJob.project_id).toBe(testProject.id);
    expect(addedJob.status).toBe('pending'); // Default status
    expect(addedJob.created_at).toBeInstanceOf(Date);
    expect(addedJob.updated_at).toBeInstanceOf(Date);

    const dbJob = await db.select().from(jobsTable).where(eq(jobsTable.id, addedJob.id)).get();
    expect(dbJob).toBeDefined();
    expect(dbJob?.name).toBe(jobData.name);
  });

  it('findById(id) - deve retornar o Job correto se o ID existir', async () => {
    const jobData: NewJob = { name: 'FindMe Job', project_id: testProject.id! };
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
    const jobData: NewJob = { name: 'Update Job Initial', project_id: testProject.id!, status: 'pending' };
    const addedJob = await jobRepository.add(jobData);

    const updateData = { status: 'executing' as Job['status'], payload: { newData: 'updated' } };
    // Pequeno delay para garantir que updated_at seja diferente
    await new Promise(resolve => setTimeout(resolve, 10));

    const updatedJob = await jobRepository.update(addedJob.id, updateData);

    expect(updatedJob).not.toBeNull();
    expect(updatedJob?.status).toBe('executing');
    expect(updatedJob?.payload).toEqual({ newData: 'updated' });
    expect(updatedJob?.updated_at?.getTime()).toBeGreaterThan(addedJob.updated_at.getTime());

    const dbJob = await db.select().from(jobsTable).where(eq(jobsTable.id, addedJob.id)).get();
    expect(dbJob?.status).toBe('executing');
  });

  it('update(jobId, data) - deve retornar null se o Job ID não existir', async () => {
    const updatedJob = await jobRepository.update('non_existent_id', { status: 'completed' });
    expect(updatedJob).toBeNull();
  });

  it('findPendingJobs - deve retornar jobs pending e delayed corretamente', async () => {
    const now = new Date();
    const anHourAgo = new Date(now.getTime() - 3600 * 1000);
    const anHourFromNow = new Date(now.getTime() + 3600 * 1000);

    await jobRepository.add({ name: 'Pending Job 1 (P2)', project_id: testProject.id!, priority: 2, created_at: new Date(now.getTime() - 2000) });
    await jobRepository.add({ name: 'Pending Job 2 (P1)', project_id: testProject.id!, priority: 1, created_at: new Date(now.getTime() - 1000) });
    // Este job 'delayed' está pronto para ser pego (updated_at + delay_ms < now)
    // No schema, delay_ms é duração. O QueueService que calcula o "available_at".
    // O repo apenas pega 'pending' ou 'delayed'. O serviço filtra.
    // Para testar o repo, vamos simular um job 'delayed' que o serviço já teria validado como 'pronto'
    // (ou seja, o serviço teria movido para 'pending' ou o repo pegaria 'delayed' e o serviço filtraria).
    // A query do repo é simplificada: pega 'pending' OR 'delayed'.
    // O teste aqui reflete a query do repo.
    await jobRepository.add({
      name: 'Delayed Job Ready (P0)',
      project_id: testProject.id!,
      status: 'delayed',
      priority: 0,
      updated_at: anHourAgo, // Irrelevante para a query atual do repo, mas bom para contexto
      delay_ms: 100 // Irrelevante para a query atual do repo
    });
    await jobRepository.add({ name: 'Executing Job', project_id: testProject.id!, status: 'executing' });

    const pendingJobs = await jobRepository.findPendingJobs({limit: 5});
    expect(pendingJobs.length).toBe(3);
    expect(pendingJobs[0].name).toBe('Delayed Job Ready (P0)'); // P0
    expect(pendingJobs[1].name).toBe('Pending Job 2 (P1)');    // P1
    expect(pendingJobs[2].name).toBe('Pending Job 1 (P2)');    // P2
  });

  it('findPendingJobs - deve retornar um array vazio se não houver Jobs elegíveis', async () => {
    await jobRepository.add({ name: 'Executing Job', project_id: testProject.id!, status: 'executing' });
    await jobRepository.add({ name: 'Completed Job', project_id: testProject.id!, status: 'completed' });

    const pendingJobs = await jobRepository.findPendingJobs();
    expect(pendingJobs.length).toBe(0);
  });

  it('findJobsByIds - deve retornar os Jobs corretos', async () => {
    const job1 = await jobRepository.add({ name: 'Job 1 for Batch Find', project_id: testProject.id! });
    const job2 = await jobRepository.add({ name: 'Job 2 for Batch Find', project_id: testProject.id! });
    await jobRepository.add({ name: 'Job 3 Not in Batch', project_id: testProject.id! });

    const foundJobs = await jobRepository.findJobsByIds([job1.id, job2.id]);
    expect(foundJobs.length).toBe(2);
    expect(foundJobs.find(j => j.id === job1.id)).toBeDefined();
    expect(foundJobs.find(j => j.id === job2.id)).toBeDefined();
  });

  it('findJobsByIds - deve retornar array vazio se nenhum ID for encontrado ou array vazio for passado', async () => {
    expect(await jobRepository.findJobsByIds([])).toEqual([]);
    expect(await jobRepository.findJobsByIds(['non_existent_id_1', 'non_existent_id_2'])).toEqual([]);
  });

});
