import { BrowserWindow } from "electron";

import { llmJobResultHandlerService } from "./llm-job-result-handler.service";

import type { JobProgressUpdate, JobCompletionEvent } from "./llm-job-queue.types";

/**
 * LLM Job Events Handler
 * 
 * Manages real-time job progress and completion events between main and renderer processes.
 * Uses Electron's webContents.send() to push updates to the UI without polling.
 */
export class LLMJobEventsHandler {
  private isInitialized = false;

  /**
   * Initialize job event handlers
   * Should be called after the main window is created
   */
  initialize(mainWindow: BrowserWindow): void {
    if (this.isInitialized) {
      console.warn("Job events handler is already initialized");
      return;
    }

    // Set up job completion event handler
    llmJobResultHandlerService.onJobCompletion((event: JobCompletionEvent) => {
      this.broadcastJobCompletion(mainWindow, event);
    });

    // Set up job progress event handler  
    llmJobResultHandlerService.onJobProgress((update: JobProgressUpdate) => {
      this.broadcastJobProgress(mainWindow, update);
    });

    this.isInitialized = true;
    console.log("Job events handler initialized");
  }

  /**
   * Cleanup event handlers
   * Should be called when the main window is closed
   */
  cleanup(): void {
    if (!this.isInitialized) {
      return;
    }

    // Remove event handlers (handlers were set up in initialize)
    // Note: The llmJobResultHandlerService doesn't provide a way to remove specific handlers
    // In a production app, we'd need to track handlers and remove them properly

    this.isInitialized = false;
    console.log("Job events handler cleaned up");
  }

  /**
   * Broadcast job completion to renderer process
   */
  private broadcastJobCompletion(mainWindow: BrowserWindow, event: JobCompletionEvent): void {
    try {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send("llm-job:completed", event);
        console.log(`Broadcasted job completion: ${event.jobId}`);
      }
    } catch (error) {
      console.error("Error broadcasting job completion:", error);
    }
  }

  /**
   * Broadcast job progress to renderer process
   */
  private broadcastJobProgress(mainWindow: BrowserWindow, update: JobProgressUpdate): void {
    try {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send("llm-job:progress", update);
        console.log(`Broadcasted job progress: ${update.jobId} - ${update.progress}%`);
      }
    } catch (error) {
      console.error("Error broadcasting job progress:", error);
    }
  }

  /**
   * Manually trigger a job status broadcast
   * Used for immediate updates when job status changes
   */
  async triggerJobStatusBroadcast(mainWindow: BrowserWindow, jobId: string): Promise<void> {
    try {
      const status = await llmJobResultHandlerService.getJobStatus(jobId);
      if (status) {
        const update: JobProgressUpdate = {
          jobId: status.id,
          progress: status.progress,
          status: status.status as any,
          // Add intermediate result if available
          intermediateResult: status.result ? status.result : undefined,
        };

        this.broadcastJobProgress(mainWindow, update);
      }
    } catch (error) {
      console.error(`Error triggering job status broadcast for ${jobId}:`, error);
    }
  }

  /**
   * Broadcast queue statistics
   * Used for monitoring dashboard updates
   */
  async broadcastQueueStats(mainWindow: BrowserWindow): Promise<void> {
    try {
      const stats = await llmJobResultHandlerService.getQueueStats();
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send("llm-job:queue-stats", stats);
      }
    } catch (error) {
      console.error("Error broadcasting queue stats:", error);
    }
  }

  /**
   * Start periodic queue stats broadcasting
   * Useful for monitoring dashboards
   */
  startQueueStatsBroadcasting(mainWindow: BrowserWindow, intervalMs = 5000): NodeJS.Timeout {
    return setInterval(() => {
      this.broadcastQueueStats(mainWindow);
    }, intervalMs);
  }
}

// Export singleton instance
export const llmJobEventsHandler = new LLMJobEventsHandler();