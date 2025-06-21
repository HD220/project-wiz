// src/core/ports/agent.interface.ts

import { IProcessor } from './queue/processor.interface';
import { Job } from '../domain/entities/jobs/job.entity';

/**
 * Represents an Agent responsible for processing a specific type of job.
 * It extends the generic IProcessor interface.
 *
 * An Agent might have additional responsibilities such as managing
 * its own specific tools or context required for the tasks it handles.
 */
export interface IAgent<PInput = any, POutput = any> extends IProcessor<PInput, POutput> {
  // process(job: Job<PInput, POutput>): Promise<POutput | void>; // Already inherited from IProcessor

  // Example of an additional method an Agent might have:
  // getName(): string;

  // For now, no additional methods are strictly required beyond IProcessor.
  // Future methods could include setup, teardown, or tool registration if needed.
}
