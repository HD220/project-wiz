import { IRepository } from '@/core/common/repository';
import { Job } from '@/core/domain/entities/job/job.entity';
import { Result } from '@/shared/result'; // Added import

export interface IJobRepository extends IRepository<typeof Job> { // Changed to interface
    // Retorna o primeiro job PENDING ou um DELAYED pronto, ordenado por prioridade e data.
    // Não lida com checagem de dependências complexas aqui (simplificado).
    findNextProcessableJob(): Promise<Result<Job | null>>;
}
