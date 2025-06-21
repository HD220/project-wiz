// src/core/application/use-cases/job/remove-job.usecase.ts
import { IJobRepository } from '../../../../core/ports/repositories/job.interface';

export interface IRemoveJobUseCase {
  execute(jobId: string): Promise<void>;
}

export class RemoveJobUseCase implements IRemoveJobUseCase {
  constructor(private jobRepository: IJobRepository) {}

  async execute(jobId: string): Promise<void> {
    console.log(`RemoveJobUseCase: Removing job ${jobId}`);
    const job = await this.jobRepository.findById(jobId);
    if (!job) {
      throw new Error(`Job with id ${jobId} not found.`);
    }
    await this.jobRepository.delete(jobId);
    console.log(`RemoveJobUseCase: Job ${jobId} successfully marked for deletion by repository.`);
  }
}
