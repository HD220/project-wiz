import { describe, it, expect, beforeEach, vi, type Mocked } from 'vitest';
import { QueueService } from './QueueService';
import type { IJobRepository } from '../ports/IJobRepository';
import type { Job, NewJob } from '../../domain/schemas';
import { insertJobSchema as globalInsertJobSchema } from '../../domain/schemas'; // Importar o schema global
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
  // testProjectId não é mais necessário como variável global para os Jobs,
  // mas pode ser usado se o payload de um job precisar referenciar um projeto.
  let exampleProjectId = 'proj_queueservice_test_' + Math.random().toString(36).substring(7);


  beforeEach(() => {
    vi.resetAllMocks();
    queueService = new QueueService(mockJobRepository);
  });

  it('addJob - deve chamar jobRepository.add com os dados corretos e status pending', async () => {
    const jobData: NewJob = {
      name: 'Test Add Job',
      // project_id: exampleProjectId, // Removido
      payload: { data: 'test', forProjectId: exampleProjectId }, // project_id agora pode estar no payload
      persona_id: 'persona_test_add'
    };
    // O schema não tem mais project_id, então não estará em expectedJobInRepo se não estiver em jobData
    const expectedJobInRepo: NewJob = { ...jobData, status: 'pending' };
    const returnedJob: Job = {
      ...jobData, // Manter os dados originais aqui para a asserção
      id: 'job_1',
      status: 'pending', // Garantir que o status seja o esperado
      created_at: new Date(),
      updated_at: new Date(),
      attempts:0, max_attempts:3, priority:0
    } as Job;

    mockJobRepository.add.mockResolvedValue(returnedJob);

    const job = await queueService.addJob(jobData);

    expect(mockJobRepository.add).toHaveBeenCalledWith(expect.objectContaining(expectedJobInRepo));
    expect(job).toEqual(returnedJob);
  });

  it('addJob - deve lançar erro se a validação Zod falhar (ex: nome vazio quando fornecido)', async () => {
    // O schema agora permite nome nulo/opcional, mas se fornecido como string, não pode ser vazio.
    const jobDataWithEmptyName = { name: '' } as NewJob;
    // Para outros campos obrigatórios não fornecidos (ex: se NewJob os tivesse), Zod pegaria.
    // O insertJobSchema atual de schemas.ts já tem a validação min(1) para 'name' se ele for uma string.
    // E project_id é opcional.

    // Este teste agora verifica a constraint de `name` não ser uma string vazia *se fornecido*.
    // Se `name` fosse totalmente omitido (undefined), e o schema o permite, não falharia por `name`.
    await expect(queueService.addJob(jobDataWithEmptyName)).rejects.toThrow(/Job name cannot be empty/);
  });

  it('getNextJob - deve retornar null se não houver jobs pendentes', async () => {
    mockJobRepository.findPendingJobs.mockResolvedValue([]);
    const job = await queueService.getNextJob();
    expect(job).toBeNull();
    expect(mockJobRepository.findPendingJobs).toHaveBeenCalled();
  });

  it('getNextJob - deve pegar um job pending sem dependências e marcá-lo como executing', async () => {
    const pendingJob: Job = {
      id: 'job_pending_1', name: 'Pending Job', status: 'pending',
      created_at: new Date(), updated_at: new Date(), attempts: 0, max_attempts: 3, priority: 0,
      depends_on_job_ids: [], // Sem dependências
      persona_id: 'persona_test_getnext',
    } as Job; // Cast para Job, assumindo que outros campos obrigatórios estão lá ou não são relevantes para este mock
    const executingJob: Job = { ...pendingJob, status: 'executing', started_at: new Date() };

    mockJobRepository.findPendingJobs.mockResolvedValue([pendingJob]);
    mockJobRepository.update.mockResolvedValue(executingJob);

    const job = await queueService.getNextJob({ personaId: 'persona_test_getnext' });

    expect(job).toEqual(executingJob);
    expect(mockJobRepository.update).toHaveBeenCalledWith(pendingJob.id, {
      status: 'executing',
      started_at: expect.any(Date),
      delay_ms: 0,
      failed_reason: null
    });
  });

  it('getNextJob - não deve pegar job delayed se o delay não expirou', async () => {
    const now = new Date();
    const delayedJob: Job = {
      id: 'job_delayed_1', name: 'Delayed Job Not Ready', status: 'delayed',
      updated_at: now,
      delay_ms: 100000, // Delay de 100s
      persona_id: 'persona_test_delay',
    } as Job;
    mockJobRepository.findPendingJobs.mockResolvedValue([delayedJob]);

    const job = await queueService.getNextJob({ personaId: 'persona_test_delay' });
    expect(job).toBeNull();
  });

  it('getNextJob - deve pegar job delayed se o delay expirou', async () => {
    const now = new Date();
    const pastTime = new Date(now.getTime() - 2000);
    const delayedJobReady: Job = {
      id: 'job_delayed_2', name: 'Delayed Job Ready', status: 'delayed',
      updated_at: pastTime,
      delay_ms: 1000, // Delay de 1s, já expirado
      persona_id: 'persona_test_delay_ready',
    } as Job;
    const executingJob: Job = { ...delayedJobReady, status: 'executing', started_at: expect.any(Date) };

    mockJobRepository.findPendingJobs.mockResolvedValue([delayedJobReady]);
    mockJobRepository.update.mockResolvedValue(executingJob);

    const job = await queueService.getNextJob({ personaId: 'persona_test_delay_ready' });
    expect(job).toEqual(executingJob);
  });

  it('getNextJob - deve marcar job como waiting_dependency se dependências não estão completas', async () => {
    const dependentJob: Job = {
      id: 'job_dep_1', name: 'Dependent Job', status: 'pending',
      depends_on_job_ids: ['dep_job_id_1'],
      persona_id: 'persona_test_dep',
    } as Job;
    const uncompletedDependency: Job = { id: 'dep_job_id_1', status: 'pending' } as Job;

    mockJobRepository.findPendingJobs.mockResolvedValue([dependentJob]);
    mockJobRepository.findJobsByIds.mockResolvedValue([uncompletedDependency]);
    // Simula o update para waiting_dependency
    mockJobRepository.update.mockImplementation(async (id, data) => ({ ...dependentJob, ...data } as Job));


    const job = await queueService.getNextJob({ personaId: 'persona_test_dep' });
    expect(job).toBeNull();
    expect(mockJobRepository.findJobsByIds).toHaveBeenCalledWith(['dep_job_id_1']);
    expect(mockJobRepository.update).toHaveBeenCalledWith(dependentJob.id, { status: 'waiting_dependency' });
  });

  it('getNextJob - deve pegar job se dependências estão completas', async () => {
    const dependentJob: Job = {
      id: 'job_dep_2', name: 'Dependent Job Ready', status: 'pending',
      depends_on_job_ids: ['dep_job_id_2'],
      persona_id: 'persona_test_dep_ready',
    } as Job;
    const completedDependency: Job = { id: 'dep_job_id_2', status: 'completed' } as Job;
    const executingJob: Job = { ...dependentJob, status: 'executing', started_at: expect.any(Date) };

    mockJobRepository.findPendingJobs.mockResolvedValue([dependentJob]);
    mockJobRepository.findJobsByIds.mockResolvedValue([completedDependency]);
    mockJobRepository.update.mockResolvedValue(executingJob);

    const job = await queueService.getNextJob({ personaId: 'persona_test_dep_ready' });
    expect(job).toEqual(executingJob);
  });

  it('completeJob - deve chamar jobRepository.update com status completed e resultado', async () => {
    const jobId = 'job_to_complete';
    const resultPayload = { data: 'success' };
    // Mock do update para retornar o job com os novos valores
    mockJobRepository.update.mockImplementation(async (id, data) => ({
      id,
      name: 'some name',
      status: 'completed',
      result: resultPayload,
      completed_at: data.completed_at,
      failed_reason: null
    } as Job));

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
      id: 'job_to_fail_1', name: 'Fail Job Retry', status: 'executing',
      attempts: 0, max_attempts: 3, retry_delay_base_ms: 100, persona_id: 'p1'
    } as Job;

    mockJobRepository.findById.mockResolvedValue(jobToFail);
    mockJobRepository.update.mockImplementation(async (id, data) => ({...jobToFail, ...data } as Job));

    await queueService.failJob(jobToFail.id, 'Test failure');
    expect(mockJobRepository.update).toHaveBeenCalledWith(jobToFail.id, {
      status: 'delayed',
      failed_reason: 'Test failure',
      attempts: 1,
      delay_ms: 100,
      updated_at: expect.any(Date),
    });
    expect(queueService['activeJobIds'].has(jobToFail.id)).toBe(false);
  });

  it('failJob - deve ir para failed se tentativas >= max_attempts', async () => {
    const jobToFail: Job = {
      id: 'job_to_fail_2', name: 'Fail Job Max Attempts', status: 'executing',
      attempts: 2, max_attempts: 3, persona_id: 'p1'
    } as Job;

    mockJobRepository.findById.mockResolvedValue(jobToFail);
    mockJobRepository.update.mockImplementation(async (id, data) => ({...jobToFail, ...data} as Job));

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
