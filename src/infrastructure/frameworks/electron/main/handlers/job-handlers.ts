import { JobId, JobStatus } from "@/core/domain/entities/job"; // Assuming JobStatus might be needed for some operations
import {
  IpcChannelsInternal,
  IPC_CHANNELS,
} from "@/core/application/ports/ipc-channels";
import { ElectronIpcHandler } from "../../electron-ipc.adapter";
import { ok, error } from "@/shared/result";
import { ProcessJobUseCase } from "@/core/application/use-cases/process-job.usecase";
import { IJobRepository } from "@/core/application/ports/job-repository.interface";
import { IJobDefinitionService, CreateJobInput } from "@/core/application/ports/job-definition-service.interface";
import { IQueueService } from "@/core/application/ports/queue-service.interface";
import { ActivityTypeValue } from "@/core/domain/entities/job/value-objects/activity-type.vo";

export function registerJobHandlers(
  ipcHandler: ElectronIpcHandler,
  processJobUseCase: ProcessJobUseCase, // This will be the mocked version
  jobRepository: IJobRepository,         // For findById if QueueService doesn't have it
  jobDefinitionService: IJobDefinitionService,
  queueService: IQueueService
) {
  // Handler for creating a new job
  ipcHandler.handle<
    IpcChannelsInternal["JOB"]["CREATE"]["request"],
    IpcChannelsInternal["JOB"]["CREATE"]["response"]
  >(
    IPC_CHANNELS.JOB.CREATE,
    async (data: IpcChannelsInternal["JOB"]["CREATE"]["request"]) => {
      try {
        // Transform IPC data to CreateJobInput for the service
        // The IPC_CHANNELS.JOB.CREATE.request should align with CreateJobInput structure
        // For example, data might be: { jobName: string, activityType: string, initialGoal?: string, payload?: Record<string,any>, priority?: number, ... }

        const createJobInput: CreateJobInput = {
          jobName: data.jobName,
          activityType: data.activityType as ActivityTypeValue, // Ensure this type assertion is safe or validate
          initialGoal: data.initialGoal,
          payload: data.payload,
          priority: data.priority,
          startAfter: data.startAfter ? new Date(data.startAfter) : undefined,
          dependsOnJobIds: data.dependsOnJobIds,
        };

        const job = await jobDefinitionService.createJob(createJobInput);
        // Return the created job's ID, or the full job data if useful for frontend
        return ok({ jobId: job.id.getValue() });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to create job";
        console.error("Error in JOB.CREATE IPC handler:", message, err);
        return error(message);
      }
    }
  );

  // Handler for getting job status (and potentially more details)
  ipcHandler.handle<
    IpcChannelsInternal["JOB"]["GET_STATUS"]["request"],
    IpcChannelsInternal["JOB"]["GET_STATUS"]["response"]
  >(
    IPC_CHANNELS.JOB.GET_STATUS,
    async (data: IpcChannelsInternal["JOB"]["GET_STATUS"]["request"]) => {
      try {
        // Using queueService.findById which was added in a previous step
        const job = await queueService.findById(JobId.fromString(data.jobId));
        if (job) {
          // Return relevant job details, not necessarily the full entity
          return ok({
            id: job.id.getValue(),
            name: job.name.getValue(),
            status: job.status.getValue(),
            // activityContext: job.data.getData(), // Might be too much, consider specific fields
            // payload: job.payload,
            // result: job.result,
            createdAt: job.createdAt.toISOString(),
            updatedAt: job.updatedAt.toISOString(),
          });
        }
        return ok(null); // Or error if job not found should be an error condition
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to get job status";
        console.error("Error in JOB.GET_STATUS IPC handler:", message, err);
        return error(message);
      }
    }
  );

  // Handler for processing a job (will use the mocked processJobUseCase)
  ipcHandler.handle<
    IpcChannelsInternal["JOB"]["PROCESS"]["request"],
    IpcChannelsInternal["JOB"]["PROCESS"]["response"]
  >(
    IPC_CHANNELS.JOB.PROCESS,
    async (data: IpcChannelsInternal["JOB"]["PROCESS"]["request"]) => {
      console.log(`IPC_CHANNELS.JOB.PROCESS received for job ${data.jobId}, worker ${data.workerId}. Using mocked ProcessJobUseCase.`);
      if (processJobUseCase && typeof processJobUseCase.execute === 'function') {
        try {
          const result = await processJobUseCase.execute({
            jobId: data.jobId,
            workerId: data.workerId,
          });
          // Assuming mock returns something compatible with IpcChannelsInternal["JOB"]["PROCESS"]["response"]
          return ok(result.value); // If result is a Result object
        } catch (err) {
          const message = err instanceof Error ? err.message : "Failed to process job with mocked use case";
          console.error("Error in JOB.PROCESS IPC handler (mocked):", message, err);
          return error(message);
        }
      } else {
        console.warn("processJobUseCase is not available or not a function in JOB.PROCESS handler.");
        return error("ProcessJobUseCase is not configured (mocked).");
      }
    }
  );

  // Placeholder handlers for other job-related channels
  ipcHandler.handle(IPC_CHANNELS.JOB.UPDATE, async (data: any) => {
    console.log("IPC_CHANNELS.JOB.UPDATE called with data:", data);
    return error("Job update not yet implemented.");
  });

  ipcHandler.handle(IPC_CHANNELS.JOB.CANCEL, async (data: any) => {
    console.log("IPC_CHANNELS.JOB.CANCEL called with data:", data);
    return error("Job cancellation not yet implemented.");
  });
}
