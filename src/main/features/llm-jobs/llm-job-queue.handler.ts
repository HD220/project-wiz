import { AuthService } from "@/main/features/auth/auth.service";
import { createIpcHandler } from "@/main/utils/ipc-handler";

import { BrowserWindow } from "electron";

import { llmJobQueueService } from "./llm-job-queue.service";
import { llmJobResultHandlerService } from "./llm-job-result-handler.service";
import { llmJobEventsHandler } from "./llm-job-events.handler";
import { llmMessageProcessorService } from "./llm-message-processor.service";
import { llmJobVerificationService } from "./llm-job-verification.service";

import type { AddJobInput } from "./llm-job-queue.types";

/**
 * Setup IPC handlers for LLM Job Queue operations
 * Provides type-safe communication between renderer and main process
 */
export function setupLLMJobQueueHandlers(): void {
  // Submit a new job to the queue
  createIpcHandler("llm-jobs:add", async (input: AddJobInput) => {
    const currentUser = await AuthService.getCurrentUser();
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    return llmJobQueueService.addJob(input.name, input.data, input.options);
  });

  // Get job status by ID
  createIpcHandler("llm-jobs:getStatus", async (jobId: string) => {
    const currentUser = await AuthService.getCurrentUser();
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    const status = await llmJobQueueService.getJobStatus(jobId);
    if (!status) {
      throw new Error("Job not found");
    }

    return status;
  });

  // Poll for completed jobs
  createIpcHandler("llm-jobs:pollCompleted", async (limit?: number) => {
    const currentUser = await AuthService.getCurrentUser();
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    return llmJobQueueService.pollCompletedJobs(limit);
  });

  // Get failed jobs for error monitoring
  createIpcHandler("llm-jobs:getFailedJobs", async (limit?: number) => {
    const currentUser = await AuthService.getCurrentUser();
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    return llmJobQueueService.getFailedJobs(limit);
  });

  // Get queue statistics
  createIpcHandler("llm-jobs:getStats", async () => {
    const currentUser = await AuthService.getCurrentUser();
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    return llmJobQueueService.getQueueStats();
  });

  // Get pending jobs for monitoring
  createIpcHandler("llm-jobs:getPendingJobs", async (limit?: number) => {
    const currentUser = await AuthService.getCurrentUser();
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    return llmJobQueueService.getPendingJobs(limit);
  });

  // Retry a failed job
  createIpcHandler("llm-jobs:retry", async (jobId: string) => {
    const currentUser = await AuthService.getCurrentUser();
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    return llmJobQueueService.retryJob(jobId);
  });

  // Cancel a waiting/delayed job
  createIpcHandler("llm-jobs:cancel", async (jobId: string) => {
    const currentUser = await AuthService.getCurrentUser();
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    return llmJobQueueService.cancelJob(jobId);
  });

  // Clean up old jobs (admin function)
  createIpcHandler("llm-jobs:cleanup", async (olderThanMs?: number) => {
    const currentUser = await AuthService.getCurrentUser();
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    return llmJobQueueService.cleanupOldJobs(olderThanMs);
  });

  // Job result polling and retrieval handlers
  
  // Get multiple job statuses at once
  createIpcHandler("llm-jobs:getJobStatuses", async (jobIds: string[]) => {
    const currentUser = await AuthService.getCurrentUser();
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    return llmJobResultHandlerService.getJobStatuses(jobIds);
  });

  // Wait for job completion (with timeout)
  createIpcHandler("llm-jobs:waitForCompletion", async (jobId: string, timeoutMs?: number) => {
    const currentUser = await AuthService.getCurrentUser();
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    return llmJobResultHandlerService.waitForJobCompletion(jobId, timeoutMs);
  });

  // Get queue statistics (for monitoring dashboard)
  createIpcHandler("llm-jobs:getQueueStats", async () => {
    const currentUser = await AuthService.getCurrentUser();
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    return llmJobResultHandlerService.getQueueStats();
  });

  // Get failed jobs (for error monitoring)
  createIpcHandler("llm-jobs:getFailedJobsDetailed", async (limit?: number) => {
    const currentUser = await AuthService.getCurrentUser();
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    return llmJobResultHandlerService.getFailedJobs(limit);
  });

  // Job progress monitoring handlers

  // Manually trigger job status broadcast
  createIpcHandler("llm-jobs:triggerStatusBroadcast", async (jobId: string) => {
    const currentUser = await AuthService.getCurrentUser();
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    const mainWindow = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];
    if (mainWindow) {
      await llmJobEventsHandler.triggerJobStatusBroadcast(mainWindow, jobId);
    }
  });

  // Manually trigger queue stats broadcast
  createIpcHandler("llm-jobs:triggerQueueStatsBroadcast", async () => {
    const currentUser = await AuthService.getCurrentUser();
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    const mainWindow = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];
    if (mainWindow) {
      await llmJobEventsHandler.broadcastQueueStats(mainWindow);
    }
  });

  // Code analysis job submission
  createIpcHandler("llm-jobs:analyzeCode", async (
    code: string,
    language: string,
    analysisType: "review" | "explain" | "test-generation" | "refactor",
    options?: {
      fileName?: string;
      relatedFiles?: string[];
      requirements?: string;
      projectId?: string;
      priority?: number;
    }
  ) => {
    const currentUser = await AuthService.getCurrentUser();
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    return llmMessageProcessorService.processCodeAnalysis(
      currentUser.id,
      code,
      language,
      analysisType,
      options
    );
  });

  // Verification and testing handlers (development only)

  // Run complete verification suite
  createIpcHandler("llm-jobs:runVerification", async () => {
    // Note: In production, you might want to restrict this to development mode
    if (process.env["NODE_ENV"] !== "development") {
      throw new Error("Verification is only available in development mode");
    }

    return llmJobVerificationService.runCompleteVerification();
  });

  // Run comprehensive system verification (includes worker isolation and crash recovery)
  createIpcHandler("llm-jobs:runCompleteSystemVerification", async () => {
    if (process.env["NODE_ENV"] !== "development") {
      throw new Error("System verification is only available in development mode");
    }

    return llmJobVerificationService.runCompleteSystemVerification();
  });

  // Test worker isolation and crash recovery specifically  
  createIpcHandler("llm-jobs:testWorkerIsolation", async () => {
    if (process.env["NODE_ENV"] !== "development") {
      throw new Error("Worker isolation testing is only available in development mode");
    }

    return llmJobVerificationService.verifyWorkerIsolationAndCrashRecovery();
  });

  // Test end-to-end job flow specifically
  createIpcHandler("llm-jobs:testEndToEndFlow", async () => {
    if (process.env["NODE_ENV"] !== "development") {
      throw new Error("End-to-end testing is only available in development mode");
    }

    return llmJobVerificationService.verifyEndToEndJobFlow();
  });

  // Clean up test jobs
  createIpcHandler("llm-jobs:cleanupTestJobs", async () => {
    if (process.env["NODE_ENV"] !== "development") {
      throw new Error("Test cleanup is only available in development mode");
    }

    return llmJobVerificationService.cleanupTestJobs();
  });
}