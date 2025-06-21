import { IQueueService } from '../ports/queue-service.interface';
import { AutonomousAgent } from './agent/autonomous-agent.service';
import { IAgentStateRepository } from '../ports/agent-state-repository.interface';
import { Job, JobId, JobStatus } from '@/core/domain/entities/job';
import { AgentInternalState, AgentId } from '@/core/domain/entities/agent';
import { IWorkerService } from '../ports/worker-service.interface';
import { ProcessActivityResult } from './agent/autonomous-agent.types';
import type { Timeout } from 'node:timers'; // Added import for Timeout type
// SystemClock interface and default implementation (in-file for now)
interface SystemClock { now: () => Date; }
const defaultSystemClock: SystemClock = { now: () => new Date() };

export class WorkerService implements IWorkerService {
  private isProcessing: boolean = false;
  private loopInterval: Timeout | null = null; // Changed NodeJS.Timeout to Timeout

  constructor(
    private readonly queueService: IQueueService,
    private readonly autonomousAgent: AutonomousAgent,
    private readonly agentStateRepository: IAgentStateRepository,
    private readonly systemClock: SystemClock = defaultSystemClock // Injectable clock
  ) {}

  public async processJobById(jobId: JobId): Promise<void> {
    let job: Job | null = null;
    try {
      job = await this.queueService.markJobAsActive(jobId);

      if (!job) {
        console.error(`WorkerService: Job ${jobId.getValue()} not found or could not be marked active by queueService.`);
        return;
      }
      if (!job.status.isActive()) {
         console.warn(`WorkerService: Job ${jobId.getValue()} status is ${job.status.getValue()}, not active. Processing aborted.`);
         return;
      }

      const placeholderAgentId = AgentId.create('default-agent');
      let agentState = await this.agentStateRepository.findByAgentId(placeholderAgentId);
      if (!agentState) {
        const defaultGoal = `Process job ${job.name.getValue()} (ID: ${job.id.getValue()})`;
        agentState = AgentInternalState.create({ agentId: placeholderAgentId, currentGoal: defaultGoal });
        await this.agentStateRepository.save(agentState);
        console.log(`WorkerService: Created default AgentInternalState for ${placeholderAgentId.getValue()}`);
      } else {
        const updatedGoal = `Process job ${job.name.getValue()} (ID: ${job.id.getValue()})`;
        if (agentState.currentGoal !== updatedGoal) {
          agentState = agentState.updateGoal(updatedGoal);
          await this.agentStateRepository.save(agentState);
        }
      }

      console.log(`WorkerService: Processing Job ${job.id.getValue()} with Agent ${agentState.agentId.getValue()}`);
      const result: ProcessActivityResult = await this.autonomousAgent.processActivity(job, agentState);

      let jobAfterAgentProcessing = job;

      if (result.status === 'completed') {
        jobAfterAgentProcessing = await this.queueService.markJobAsCompleted(job.id, result.output || {});
        console.log(`WorkerService: Job ${jobAfterAgentProcessing.id.getValue()} completed.`);
      } else if (result.status === 'failed') {
        jobAfterAgentProcessing = await this.queueService.markJobAsFailed(job.id, result.error || 'Agent processing failed');
        console.log(`WorkerService: Job ${jobAfterAgentProcessing.id.getValue()} failed.`);
      } else {
         jobAfterAgentProcessing = jobAfterAgentProcessing.updateActivityContext(result.newContext);
         (jobAfterAgentProcessing.props as any).updatedAt = this.systemClock.now();
         await this.queueService.saveJob(jobAfterAgentProcessing);
         console.log(`WorkerService: Job ${jobAfterAgentProcessing.id.getValue()} in progress, context updated and saved.`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`WorkerService: Critical error processing job ${jobId.getValue()}: ${errorMessage}`);
      if (job && job.id) {
        await this.queueService.markJobAsFailed(job.id, `Worker critical error: ${errorMessage}`);
      } else {
        console.error(`WorkerService: Cannot mark job as failed, job object or job.id is null. Original JobId: ${jobId.getValue()}`);
      }
    }
  }

  public async checkAndProcessNextJob(): Promise<boolean> {
    if (this.isProcessing) {
      return false;
    }
    this.isProcessing = true;
    let jobProcessed = false;
    try {
      const nextJob = await this.queueService.getNextJobToProcess();
      if (nextJob) {
        if(nextJob.status.isWaiting() || nextJob.status.isPending() || nextJob.status.isDelayed()){
             console.log(`WorkerService: Found job ${nextJob.id.getValue()} with status ${nextJob.status.getValue()}, attempting to process.`);
             await this.processJobById(nextJob.id);
             jobProcessed = true;
        } else {
             console.log(`WorkerService: Job ${nextJob.id.getValue()} found by getNextJobToProcess but status is ${nextJob.status.getValue()}. Not processing.`);
        }
      }
    } catch (error) {
      console.error("WorkerService: Error in checkAndProcessNextJob loop:", error);
    } finally {
      this.isProcessing = false;
    }
    return jobProcessed;
  }

  public async startProcessingLoop(intervalMs: number = 10000): Promise<void> {
    if (this.loopInterval) {
      console.warn("WorkerService: Processing loop already started.");
      return;
    }
    console.log(`WorkerService: Starting processing loop with interval ${intervalMs}ms.`);
    this.loopInterval = setInterval(async () => {
      await this.checkAndProcessNextJob();
    }, intervalMs);
  }

  public stopProcessingLoop(): void {
    if (this.loopInterval) {
      clearInterval(this.loopInterval);
      this.loopInterval = null;
      console.log("WorkerService: Stopped processing loop.");
    }
  }
}
