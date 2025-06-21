import type { IQueueService } from '../ports/IQueueService';
import type { IJobRepository } from '../ports/IJobRepository';
import type { Job, NewJob } from '../../domain/schemas';
import { ZodError } from 'zod';
import { insertJobSchema } from '../../domain/schemas'; // Para validação

export class QueueService implements IQueueService {
  private activeJobIds: Set<string> = new Set(); // Rastreia IDs de jobs ativamente pegos por getNextJob

  constructor(private jobRepository: IJobRepository) {}

  async addJob(jobData: NewJob): Promise<Job> {
    try {
      // Validação com Zod antes de inserir
      insertJobSchema.parse(jobData);
    } catch (error) {
      if (error instanceof ZodError) {
        console.error("Erro de validação do Job:", error.errors);
        throw new Error(`Dados do Job inválidos: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error; // Re-lançar outros erros
    }

    const jobWithStatus = { ...jobData, status: jobData.status || 'pending' };
    return this.jobRepository.add(jobWithStatus as NewJob);
  }

  async getNextJob(criteria?: { personaId?: string }): Promise<Job | null> {
    const now = new Date();
    let fetchLimit = 10; // Buscar um lote inicial
    let candidates: Job[] = [];
    let eligibleJob: Job | null = null;
    const checkedJobIds: string[] = Array.from(this.activeJobIds); // Jobs já pegos ou sendo processados

    // Buscar candidatos em lotes para não sobrecarregar a memória se houver muitos jobs
    // e para evitar pegar jobs que acabaram de ser devolvidos à fila por outro worker.
    while (true) {
      const potentialJobs = await this.jobRepository.findPendingJobs({
        personaId: criteria?.personaId,
        excludedIds: [...checkedJobIds], // Excluir os já checados ou ativos
        limit: fetchLimit,
      });

      if (potentialJobs.length === 0) {
        break; // Nenhum candidato encontrado no lote atual
      }

      for (const job of potentialJobs) {
        checkedJobIds.push(job.id); // Marcar como checado para a próxima iteração do loop de busca

        if (this.activeJobIds.has(job.id)) {
          continue; // Job já foi pego por outra chamada a getNextJob (concorrência)
        }

        // 1. Checar status 'delayed'
        if (job.status === 'delayed') {
          const availableAt = new Date(job.updated_at!.getTime() + (job.delay_ms || 0));
          if (availableAt > now) {
            continue; // Ainda não é hora
          }
        }

        // 2. Checar dependências
        if (job.depends_on_job_ids && job.depends_on_job_ids.length > 0) {
          const dependencyIds = job.depends_on_job_ids as string[]; // Cast do JSON
          const dependencies = await this.jobRepository.findJobsByIds(dependencyIds);

          const allDependenciesMet = dependencies.every(dep => dep.status === 'completed');
          if (!allDependenciesMet || dependencies.length !== dependencyIds.length) {
            // Se alguma dependência não está 'completed' ou alguma não foi encontrada
            // (o que pode significar que ainda não foi criada ou houve um erro)
            // Atualizar status para 'waiting_dependency' se ainda for 'pending' ou 'delayed'
            if (job.status === 'pending' || job.status === 'delayed') {
              await this.jobRepository.update(job.id, { status: 'waiting_dependency' });
            }
            continue;
          }
        }

        // Se passou por todas as checagens, este é o Job elegível
        eligibleJob = job;
        break;
      }

      if (eligibleJob || potentialJobs.length < fetchLimit) {
        // Encontrou um Job ou não há mais candidatos para buscar neste critério
        break;
      }
      // Se não encontrou e ainda há mais jobs potenciais, busca mais no próximo lote
    }

    if (eligibleJob) {
      this.activeJobIds.add(eligibleJob.id); // Adicionar à lista de jobs ativos
      const updatedJob = await this.jobRepository.update(eligibleJob.id, {
        status: 'executing',
        started_at: new Date(),
        // Se era 'delayed' e agora está 'executing', limpar o delay_ms para não ser considerado novamente
        // e resetar o motivo da falha se a retentativa está começando.
        ...(eligibleJob.status === 'delayed' && { delay_ms: 0, failed_reason: null })
      });
      if (!updatedJob) { // Falha ao atualizar para 'executing', outro worker pode ter pego
        this.activeJobIds.delete(eligibleJob.id);
        return this.getNextJob(criteria); // Tentar pegar o próximo
      }
      return updatedJob;
    }
    return null;
  }

  async completeJob(jobId: string, resultPayload: Job['result']): Promise<Job | null> {
    this.activeJobIds.delete(jobId); // Remover da lista de ativos
    return this.jobRepository.update(jobId, {
      status: 'completed',
      result: resultPayload,
      completed_at: new Date(),
      failed_reason: null, // Limpar razão de falha em caso de sucesso
    });
  }

  async failJob(jobId: string, reason: string): Promise<Job | null> {
    this.activeJobIds.delete(jobId); // Remover da lista de ativos
    const job = await this.jobRepository.findById(jobId);
    if (!job) return null;

    const currentAttempts = (job.attempts ?? 0) + 1;

    if (currentAttempts >= (job.max_attempts ?? 3)) {
      return this.jobRepository.update(jobId, {
        status: 'failed',
        failed_reason: reason,
        attempts: currentAttempts,
        completed_at: new Date(), // Marcamos como 'completed' em termos de ciclo de tentativas
      });
    } else {
      const retryDelayBase = job.retry_delay_base_ms ?? 1000;
      // Multiplicador pode ser configurável ou baseado no número de tentativas
      const delayDurationMs = retryDelayBase * (2 ** (currentAttempts - 1));

      return this.jobRepository.update(jobId, {
        status: 'delayed',
        failed_reason: reason,
        attempts: currentAttempts,
        delay_ms: delayDurationMs, // Duração do delay
        updated_at: new Date(),
      });
    }
  }

  async updateJobStatus(jobId: string, status: Job['status']): Promise<Job | null> {
    // Se o job estava ativo e agora mudou de status (ex: para 'pending' por uma ação externa), remover de activeJobIds
    if (status !== 'executing' && status !== 'delayed') { // delayed é um tipo de "ativo" para fins de retentativa
        this.activeJobIds.delete(jobId);
    }
    return this.jobRepository.update(jobId, { status });
  }

  async updateJobData(jobId: string, data: Job['data']): Promise<Job | null> {
    // Este método é para atualizar o campo 'data' (ActivityContext)
    return this.jobRepository.update(jobId, { data });
  }
}
