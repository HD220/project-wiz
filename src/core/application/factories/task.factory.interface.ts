import { Result } from '@/shared/result';
import { Job } from '@/core/domain/entities/job/job.entity';
// Assuming Task interface/class is defined here:
import { Task } from '../../ports/task.interface';
// Alternative if BaseTask is the primary export:
// import { BaseTask as Task } from '../../domain/entities/task/base-task';


export interface ITaskFactory {
    // Retorna uma Task específica baseada em um identificador de tipo de task.
    // O Job pode ser usado para fornecer contexto adicional se a factory precisar.
    createTask(taskType: string, job?: Job): Result<Task>;
}
