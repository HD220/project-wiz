// src_refactored/infrastructure/queue/drizzle/queue-maintenance.service.ts
import EventEmitter from 'node:events';

import { IJobRepository } from "@/core/application/ports/job-repository.interface";
// JobStatus not directly needed here
import { JobEntity } from "@/core/domain/job/job.entity";

// This service could implement an IQueueMaintenanceService interface
export class QueueMaintenanceService<P, R> {
  private _isMaintenanceRunning: boolean = false;
  private maintenanceLoopPromise: Promise<void> | null = null;
  // Consider making this configurable
  private readonly maintenanceIntervalMs: number = 15000;

  constructor(
    private readonly jobRepository: IJobRepository,
    // Or a dedicated JobEventEmitter
    private readonly eventEmitter: EventEmitter,
    private readonly queueName: string
  ) {}

  // Corresponds to AbstractQueue.startMaintenance
  public startMaintenance(): void {
    if (this._isMaintenanceRunning) return;
    this._isMaintenanceRunning = true;
    this.maintenanceLoopPromise = this.runMaintenanceLoop();
  }

  // Corresponds to AbstractQueue.stopMaintenance
  public async stopMaintenance(): Promise<void> {
    if (!this._isMaintenanceRunning && !this.maintenanceLoopPromise) {
      return;
    }
    this._isMaintenanceRunning = false;
    if (this.maintenanceLoopPromise) {
      try {
        await this.maintenanceLoopPromise;
      } catch (error) {
        this.eventEmitter.emit("queue.error", new Error(`Maintenance loop stop error: ${error instanceof Error ? error.message : String(error)}`));
      }
    }
    this.maintenanceLoopPromise = null;
  }

  private async runMaintenanceLoop(): Promise<void> {
    while (this._isMaintenanceRunning) {
      try {
        // Limit fetching to 10 stalled jobs per cycle
        const stalledJobs = await this.jobRepository.findStalledJobs(
          this.queueName,
          new Date(),
          10
        );
        for (const job of stalledJobs) {
          await this._processStalledJob(job as JobEntity<P, R>);
        }
      } catch (error) {
        // Keep console.error for critical maintenance issues
        console.error(
          "[QueueMaintenanceService] Error during stalled job maintenance:",
          error
        );
        this.eventEmitter.emit("queue.error", new Error(`Stalled job maintenance: ${error instanceof Error ? error.message : String(error)}`));
      }

      if (this._isMaintenanceRunning) {
        await new Promise((resolve) =>
          setTimeout(resolve, this.maintenanceIntervalMs)
        );
      }
    }
  }

  private async _processStalledJob(jobEntity: JobEntity<P, R>): Promise<void> {
    const wasAlreadyFailedByStallLogic = jobEntity.markAsStalled();

    if (!wasAlreadyFailedByStallLogic) {
      jobEntity.moveToWaiting();
    }
    await this.jobRepository.update(jobEntity);
    this.eventEmitter.emit("job.stalled", jobEntity);
  }
}
