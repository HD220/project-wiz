// src/core/application/use-cases/job/save-job.usecase.ts
import { Job, JobProps } from '../../../domain/entities/jobs/job.entity';
import { IJobRepository } from '../../../../core/ports/repositories/job.interface';

// Define a DTO for creating/updating jobs if JobProps is not suitable directly
// For now, assuming JobProps (or a subset) can be used.
export type SaveJobDTO = Partial<Omit<JobProps<any, any>, 'queueId' | 'name'>> & {
  queueId: string;
  name: string;
  targetAgentRole?: string;
  requiredCapabilities?: string[];
};

export interface ISaveJobUseCase {
  execute(jobData: SaveJobDTO): Promise<Job<any, any>>;
}

export class SaveJobUseCase implements ISaveJobUseCase {
  constructor(private jobRepository: IJobRepository) {}

  async execute(jobData: SaveJobDTO): Promise<Job<any, any>> {
    console.log(`SaveJobUseCase: Saving job with name ${jobData.name} for queue ${jobData.queueId}`);

    // If jobData contains an ID, it's an update, otherwise it's a creation.
    // Job.create handles ID generation for new jobs.
    // The repository's save method handles upsert logic.

    let jobToSave: Job<any,any>;
    if (jobData.id) {
        const existingJob = await this.jobRepository.findById(jobData.id);
        if (!existingJob) {
            throw new Error(`Job with id ${jobData.id} not found for update.`);
        }
        // Update existing job properties. Job constructor or a dedicated update method should handle this.
        // The Job class's props was made public for this, allowing direct update before save.
        // A more encapsulated approach would be an `existingJob.update(jobData)` method.
        Object.assign(existingJob.props, jobData);
        (existingJob.props as any).updatedAt = new Date(); // Manually update updatedAt before saving
        jobToSave = existingJob;
    } else {
        // This is a new job. Job.create now handles targetAgentRole and requiredCapabilities.
        jobToSave = Job.create(jobData as JobProps<any,any>); // Cast needed as SaveJobDTO is Partial for some JobProps fields
    }

    await this.jobRepository.save(jobToSave);
    // Fetch the job again if save doesn't return it, to ensure we have the persisted state (e.g., ID, createdAt)
    // Or assume jobToSave is updated in-place by reference if Job.create/constructor sets all defaults.
    // For this example, we will return the job instance that was passed to save.
    // A robust implementation might fetch it: return await this.jobRepository.findById(jobToSave.id);
    return jobToSave;
  }
}
