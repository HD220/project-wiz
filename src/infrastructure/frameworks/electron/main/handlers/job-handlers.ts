import { JobId } from "@/core/domain/entities/job/value-objects/job-id.vo";
import {
  // Removido 'type' para IPC_CHANNELS
  IpcChannelsInternal,
  IPC_CHANNELS,
} from "@/core/application/ports/ipc-channels";
import { ElectronIpcHandler } from "../../electron-ipc.adapter";
import { ok, error } from "@/shared/result";
import { ProcessJobUseCase } from "@/core/application/use-cases/process-job.usecase";
import { JobRepositoryDrizzle } from "@/infrastructure/repositories/job-drizzle.repository";
// Removidos imports de WorkerJobServiceAdapter, WorkerJobServiceImpl, WorkerAssignmentServiceImpl, WorkerRepository, QueueService

export function registerJobHandlers(
  ipcHandler: ElectronIpcHandler,
  processJobUseCase: ProcessJobUseCase,
  jobRepository: JobRepositoryDrizzle
) {
  ipcHandler.handle<
    IpcChannelsInternal["JOB"]["PROCESS"]["request"],
    IpcChannelsInternal["JOB"]["PROCESS"]["response"]
  >(
    IPC_CHANNELS.JOB.PROCESS,
    async (data: IpcChannelsInternal["JOB"]["PROCESS"]["request"]) => {
      try {
        const result = await processJobUseCase.execute({
          jobId: data.jobId, // Corrigido: data.jobId já é string
          workerId: data.workerId,
        });
        return ok(result);
      } catch (_err) {
        return error("Failed to process job");
      }
    }
  );

  ipcHandler.handle<
    IpcChannelsInternal["JOB"]["GET_STATUS"]["request"],
    IpcChannelsInternal["JOB"]["GET_STATUS"]["response"]
  >(
    IPC_CHANNELS.JOB.GET_STATUS,
    async (data: IpcChannelsInternal["JOB"]["GET_STATUS"]["request"]) => {
      try {
        const job = await jobRepository.findById(new JobId(data.jobId)); // Mantido new JobId(data.jobId)
        return ok(job || null);
      } catch (_err) {
        return error("Failed to get job status");
      }
    }
  );

  ipcHandler.handle<
    IpcChannelsInternal["JOB"]["PROCESS"]["request"],
    IpcChannelsInternal["JOB"]["PROCESS"]["response"]
  >(
    IPC_CHANNELS.JOB.PROCESS,
    async (data: IpcChannelsInternal["JOB"]["PROCESS"]["request"]) => {
      try {
        const result = await processJobUseCase.execute({
          jobId: data.jobId, // Corrigido: data.jobId já é string
          workerId: data.workerId,
        });
        return ok(result);
      } catch (_err) {
        return error("Failed to process job");
      }
    }
  );
}
