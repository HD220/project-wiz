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
    // IJobRepository currently doesn't have a 'delete' method.
    // This will require adding it to IJobRepository and its Drizzle implementation.
    // For now, this use case will be structurally complete but non-functional until repo is updated.
    // Placeholder for the actual deletion:
    // await this.jobRepository.delete(jobId);
    console.warn(`RemoveJobUseCase: IJobRepository.delete() method not yet implemented. Job ${jobId} not actually deleted.`);
    // If there are sub-activities to remove, that logic would also go here or in the repo.
  }
}
