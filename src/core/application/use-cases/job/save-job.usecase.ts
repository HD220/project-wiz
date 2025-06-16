// src/core/application/use-cases/job/save-job.usecase.ts
import { Job, JobProps } from '../../../domain/entities/jobs/job.entity';
import { IJobRepository } from '../../../../core/ports/repositories/job.interface';

// Define a DTO for creating/updating jobs if JobProps is not suitable directly
// For now, assuming JobProps (or a subset) can be used.
export type SaveJobDTO = Partial<JobProps<any, any>> & { queueId: string; name: string; }; // Example DTO

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
        // This is an update, fetch existing to merge or rely on Job constructor to handle partial updates
        const existingJob = await this.jobRepository.findById(jobData.id);
        if (!existingJob) {
            throw new Error(`Job with id ${jobData.id} not found for update.`);
        }
        // Update properties of existingJob or create new instance with merged data
        // For simplicity, let's assume Job entity can handle this merge or a new instance is created
        // This part would need careful handling of partial updates.
        // A simpler approach for this example is to treat it like Job.create and let repo.save handle upsert.
        const updatedProps = { ...existingJob.props, ...jobData };
        jobToSave = new Job(updatedProps); // Or existingJob.update(jobData) if such method exists
    } else {
        // This is a new job
        jobToSave = Job.create(jobData);
    }

    await this.jobRepository.save(jobToSave);
    // Fetch the job again if save doesn't return it, to ensure we have the persisted state (e.g., ID, createdAt)
    // Or assume jobToSave is updated in-place by reference if Job.create/constructor sets all defaults.
    // For this example, we will return the job instance that was passed to save.
    // A robust implementation might fetch it: return await this.jobRepository.findById(jobToSave.id);
    return jobToSave;
  }
}
