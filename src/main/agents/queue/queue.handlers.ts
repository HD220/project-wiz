import { ipcMain } from "electron";
import { extractUserId } from "../../utils/auth-utils";
import {
  enqueueJob,
  getJob,
  getJobsForAgent,
  getJobsForProject,
  getQueueStats,
  cancelJob,
  completeJob,
  failJob,
  type CreateJobInput,
  type Job,
} from "./queue.service";

/**
 * Setup IPC handlers for queue operations
 * Following established patterns from other handlers
 */
export function setupQueueHandlers(): void {
  // Create new job
  ipcMain.handle("queue:create-job", async (event, input: CreateJobInput) => {
    try {
      const userId = extractUserId(event);
      const jobInput = { ...input, createdBy: userId };
      const job = await enqueueJob(jobInput);
      return { success: true, data: job };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create job",
      };
    }
  });

  // Get job by ID
  ipcMain.handle("queue:get-job", async (event, jobId: string) => {
    try {
      const job = await getJob(jobId);
      return { success: true, data: job };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get job",
      };
    }
  });

  // Get jobs for agent
  ipcMain.handle("queue:get-agent-jobs", async (event, agentId: string) => {
    try {
      const jobs = await getJobsForAgent(agentId);
      return { success: true, data: jobs };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to get agent jobs",
      };
    }
  });

  // Get jobs for project
  ipcMain.handle("queue:get-project-jobs", async (event, projectId: string) => {
    try {
      const jobs = await getJobsForProject(projectId);
      return { success: true, data: jobs };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to get project jobs",
      };
    }
  });

  // Get queue statistics
  ipcMain.handle("queue:get-stats", async (event) => {
    try {
      const stats = await getQueueStats();
      return { success: true, data: stats };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to get queue stats",
      };
    }
  });

  // Cancel job
  ipcMain.handle("queue:cancel-job", async (event, jobId: string) => {
    try {
      const userId = extractUserId(event);

      // Get job to check permissions
      const job = await getJob(jobId);
      if (!job) {
        throw new Error("Job not found");
      }

      // Only job creator can cancel
      if (job.createdBy !== userId) {
        throw new Error("Only job creator can cancel it");
      }

      await cancelJob(jobId);
      return { success: true, data: null };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to cancel job",
      };
    }
  });

  // Complete job (internal use by agents)
  ipcMain.handle(
    "queue:complete-job",
    async (event, jobId: string, result?: any) => {
      try {
        await completeJob(jobId, result);
        return { success: true, data: null };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to complete job",
        };
      }
    },
  );

  // Fail job (internal use by agents)
  ipcMain.handle(
    "queue:fail-job",
    async (event, jobId: string, error: string) => {
      try {
        await failJob(jobId, error);
        return { success: true, data: null };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to fail job",
        };
      }
    },
  );
}
