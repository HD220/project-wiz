import { describe, it, expect, beforeEach, vi, type Mocked } from 'vitest';
import { QueueService } from './QueueService';
import type { IJobRepository } from '../ports/IJobRepository';
import type { Job, NewJob } from '../../domain/schemas';
import { insertJobSchema } from '../../domain/schemas'; // Para testar validação
import { ZodError } from 'zod';

// Mock do IJobRepository
const mockJobRepository: Mocked<IJobRepository> = {
  add: vi.fn(),
  findById: vi.fn(),
  findPendingJobs: vi.fn(),
  findJobsByIds: vi.fn(),
  update: vi.fn(),
};

describe('QueueService', () => {
  let queueService: QueueService;
  let testProjectId = 'proj_queueservice_test';

  beforeEach(() => {
    vi.resetAllMocks(); // Limpa mocks entre os testes
    queueService = new QueueService(mockJobRepository);
    testProjectId = 'proj_queueservice_test_' + Math.random().toString(36).substring(7);
  });

  it('addJob - deve chamar jobRepository.add com os dados corretos e status pending', async () => {
    const jobData: NewJob = {
      name: 'Test Add Job',
      project_id: testProjectId,
      payload: { data: 'test' },
    };
    const expectedJobInRepo: NewJob = { ...jobData, status: 'pending' };
    const returnedJob: Job = { ...expectedJobInRepo, id: 'job_1', created_at: new Date(), updated_at: new Date(), attempts:0, max_attempts:3, priority:0 } as Job;

    mockJobRepository.add.mockResolvedValue(returnedJob);

    const job = await queueService.addJob(jobData);

    expect(mockJobRepository.add).toHaveBeenCalledWith(expect.objectContaining(expectedJobInRepo));
    expect(job).toEqual(returnedJob);
  });

  it('addJob - deve lançar erro se a validação Zod falhar', async () => {
    const jobData = { project_id: testProjectId, name: null } as unknown as NewJob; // Forçar dado inválido
    // Supondo que 'name' é notNull no schema Zod (precisa ajustar insertJobSchema para isso se não for)
    // Para este teste, vamos assumir que insertJobSchema valida 'name' como string não vazia.
    // Se insertJobSchema for muito permissivo, este teste pode não falhar como esperado.
    // Adicionando uma validação mais estrita no schema para o teste:
    const strictInsertJobSchema = insertJobSchema.extend({ name: z.string().min(1) });
    const originalSchema = insertJobSchema; // Salvar original
    (globalThis as any).insertJobSchema = strictInsertJobSchema; // Mock global temporário ou injetar schema

    // Monkey patching schema para este teste - não ideal, mas para exemplo
    const realInsertJobSchema = await import('../../domain/schemas');
    const originalInsertSchema = realInsertJobSchema.insertJobSchema;
    (realInsertJobSchema as any).insertJobSchema = insertJobSchema.extend({ name: z.string().min(1) });


    await expect(queueService.addJob(jobData)).rejects.toThrow(/Dados do Job inválidos/);

    (realInsertJobSchema as any).insertJobSchema = originalInsertSchema; // Restaurar
  });

  it('getNextJob - deve retornar null se não houver jobs pendentes', async () => {
    mockJobRepository.findPendingJobs.mockResolvedValue([]);
    const job = await queueService.getNextJob();
    expect(job).toBeNull();
    expect(mockJobRepository.findPendingJobs).toHaveBeenCalled();
  });

  it('getNextJob - deve pegar um job pending sem dependências e marcá-lo como executing', async () => {
    const pendingJob: Job = {
      id: 'job_pending_1', name: 'Pending Job', project_id: testProjectId, status: 'pending',
      created_at: new Date(), updated_at: new Date(), attempts: 0, max_attempts: 3, priority: 0,
      depends_on_job_ids: [],
    } as Job;
    const executingJob: Job = { ...pendingJob, status: 'executing', started_at: new Date() };

    mockJobRepository.findPendingJobs.mockResolvedValue([pendingJob]);
    mockJobRepository.update.mockResolvedValue(executingJob);

    const job = await queueService.getNextJob();

    expect(job).toEqual(executingJob);
    expect(mockJobRepository.update).toHaveBeenCalledWith(pendingJob.id, {
      status: 'executing',
      started_at: expect.any(Date),
      delay_ms: 0, // Adicionado no overwrite do App.tsx
      failed_reason: null // Adicionado no overwrite do App.tsx
    });
  });

  it('getNextJob - não deve pegar job delayed se o delay não expirou', async () => {
    const now = new Date();
    const futureTime = new Date(now.getTime() + 100000); // 100s no futuro
    const delayedJob: Job = {
      id: 'job_delayed_1', name: 'Delayed Job Not Ready', project_id: testProjectId, status: 'delayed',
      updated_at: now, // Atualizado agora
      delay_ms: 100000, // Delay de 100s
    } as Job;
    mockJobRepository.findPendingJobs.mockResolvedValue([delayedJob]);

    const job = await queueService.getNextJob();
    expect(job).toBeNull();
  });

  it('getNextJob - deve pegar job delayed se o delay expirou', async () => {
    const now = new Date();
    const pastTime = new Date(now.getTime() - 2000); // 2s no passado
    const delayedJobReady: Job = {
      id: 'job_delayed_2', name: 'Delayed Job Ready', project_id: testProjectId, status: 'delayed',
      updated_at: pastTime, // Atualizado 2s atrás
      delay_ms: 1000,       // Delay de 1s
    } as Job;
    const executingJob: Job = { ...delayedJobReady, status: 'executing', started_at: expect.any(Date) };

    mockJobRepository.findPendingJobs.mockResolvedValue([delayedJobReady]);
    mockJobRepository.update.mockResolvedValue(executingJob);

    const job = await queueService.getNextJob();
    expect(job).toEqual(executingJob);
    expect(mockJobRepository.update).toHaveBeenCalledWith(delayedJobReady.id, {
      status: 'executing',
      started_at: expect.any(Date),
      delay_ms: 0,
      failed_reason: null,
    });
  });

  it('getNextJob - deve marcar job como waiting_dependency se dependências não estão completas', async () => {
    const dependentJob: Job = {
      id: 'job_dep_1', name: 'Dependent Job', project_id: testProjectId, status: 'pending',
      depends_on_job_ids: ['dep_job_id_1'],
    } as Job;
    const uncompletedDependency: Job = { id: 'dep_job_id_1', status: 'pending' } as Job;

    mockJobRepository.findPendingJobs.mockResolvedValue([dependentJob]);
    mockJobRepository.findJobsByIds.mockResolvedValue([uncompletedDependency]);
    mockJobRepository.update.mockResolvedValue({ ...dependentJob, status: 'waiting_dependency' }); // Simula o update

    const job = await queueService.getNextJob();
    expect(job).toBeNull(); // Não deve retornar este job
    expect(mockJobRepository.findJobsByIds).toHaveBeenCalledWith(['dep_job_id_1']);
    expect(mockJobRepository.update).toHaveBeenCalledWith(dependentJob.id, { status: 'waiting_dependency' });
  });

  it('getNextJob - deve pegar job se dependências estão completas', async () => {
    const dependentJob: Job = {
      id: 'job_dep_2', name: 'Dependent Job Ready', project_id: testProjectId, status: 'pending',
      depends_on_job_ids: ['dep_job_id_2'],
    } as Job;
    const completedDependency: Job = { id: 'dep_job_id_2', status: 'completed' } as Job;
    const executingJob: Job = { ...dependentJob, status: 'executing', started_at: expect.any(Date) };

    mockJobRepository.findPendingJobs.mockResolvedValue([dependentJob]);
    mockJobRepository.findJobsByIds.mockResolvedValue([completedDependency]);
    mockJobRepository.update.mockResolvedValue(executingJob);

    const job = await queueService.getNextJob();
    expect(job).toEqual(executingJob);
    expect(mockJobRepository.findJobsByIds).toHaveBeenCalledWith(['dep_job_id_2']);
    expect(mockJobRepository.update).toHaveBeenCalledWith(dependentJob.id, {
      status: 'executing',
      started_at: expect.any(Date),
      delay_ms: 0,
      failed_reason: null,
    });
  });

  it('completeJob - deve chamar jobRepository.update com status completed e resultado', async () => {
    const jobId = 'job_to_complete';
    const resultPayload = { data: 'success' };
    const completedJob : Job = { id: jobId, status: 'completed', result: resultPayload } as Job;
    mockJobRepository.update.mockResolvedValue(completedJob);

    await queueService.completeJob(jobId, resultPayload);
    expect(mockJobRepository.update).toHaveBeenCalledWith(jobId, {
      status: 'completed',
      result: resultPayload,
      completed_at: expect.any(Date),
      failed_reason: null,
    });
    expect(queueService['activeJobIds'].has(jobId)).toBe(false);
  });

  it('failJob - deve ir para delayed se tentativas < max_attempts', async () => {
    const jobToFail: Job = {
      id: 'job_to_fail_1', project_id: testProjectId, name: 'Fail Job Retry', status: 'executing',
      attempts: 0, max_attempts: 3, retry_delay_base_ms: 100,
    } as Job;
    const delayedJob: Job = { ...jobToFail, status: 'delayed', attempts: 1, delay_ms: 100 } as Job;

    mockJobRepository.findById.mockResolvedValue(jobToFail);
    mockJobRepository.update.mockResolvedValue(delayedJob);

    await queueService.failJob(jobToFail.id, 'Test failure');
    expect(mockJobRepository.update).toHaveBeenCalledWith(jobToFail.id, {
      status: 'delayed',
      failed_reason: 'Test failure',
      attempts: 1,
      delay_ms: 100, // 100 * (2^(1-1)) = 100
      updated_at: expect.any(Date),
    });
    expect(queueService['activeJobIds'].has(jobToFail.id)).toBe(false);
  });

  it('failJob - deve ir para failed se tentativas >= max_attempts', async () => {
    const jobToFail: Job = {
      id: 'job_to_fail_2', project_id: testProjectId, name: 'Fail Job Max Attempts', status: 'executing',
      attempts: 2, max_attempts: 3,
    } as Job;
     const failedJob: Job = { ...jobToFail, status: 'failed', attempts: 3 } as Job;

    mockJobRepository.findById.mockResolvedValue(jobToFail);
    mockJobRepository.update.mockResolvedValue(failedJob);

    await queueService.failJob(jobToFail.id, 'Max attempts reached');
    expect(mockJobRepository.update).toHaveBeenCalledWith(jobToFail.id, {
      status: 'failed',
      failed_reason: 'Max attempts reached',
      attempts: 3,
      completed_at: expect.any(Date),
    });
     expect(queueService['activeJobIds'].has(jobToFail.id)).toBe(false);
  });

});
