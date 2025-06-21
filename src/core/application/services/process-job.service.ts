// src/core/application/services/process-job.service.ts
import { Result, ok, error } from '@/shared/result';
import { Job } from '@/core/domain/entities/job/job.entity';
import { Worker } from '@/core/domain/entities/worker/worker.entity';
import { IProcessJobService } from '../ports/process-job-service.interface';
import { IJobRepository } from '../ports/repositories/job.repository.interface';
import { IJobQueue } from '../ports/job-queue.interface';
import { IAgentService, AgentStepOutput } from '../ports/agent-service.interface'; // Added AgentStepOutput
import { Agent } from '@/core/domain/entities/agent';
import { AgentId } from '@/core/domain/entities/agent/value-objects'; // Added AgentId
import { AgentRuntimeState } from '@/core/domain/entities/agent/agent-runtime-state.entity';
import { IAgentRepository } from '../ports/repositories/agent.interface';
import { IAgentRuntimeStateRepository } from '../ports/repositories/agent-runtime-state.repository.interface';
import { JobTimestamp } from '@/core/domain/entities/job/value-objects/job-timestamp.vo';
import { DomainError } from '@/core/common/errors';
import { IWorkerRepository } from '../ports/repositories/worker.repository.interface';
import { IWorkerAssignmentService } from '../ports/worker-assignment-service.interface'; // Added import
import { ILLMProviderConfigRepository } from '../ports/repositories/llm-provider-config.repository.interface'; // Added import
// import { JobBuilder } from '@/core/domain/entities/job/job-builder';


export class ProcessJobServiceImpl implements IProcessJobService {
    constructor(
        private readonly jobRepository: IJobRepository,
        private readonly jobQueue: IJobQueue,
        private readonly agentService: IAgentService,
        private readonly agentRepository: IAgentRepository,
        private readonly agentRuntimeStateRepository: IAgentRuntimeStateRepository,
        // private readonly workerRepository: IWorkerRepository, // Removed as findAvailableWorker is on assignment service and it has workerRepo
        private readonly workerAssignmentService: IWorkerAssignmentService,
        private readonly llmProviderConfigRepository: ILLMProviderConfigRepository
    ) {}

    async process(job: Job, worker: Worker): Promise<Result<Job>> {
        let currentJob = job;
        try {
            // TODO: Implementar a lógica principal de processamento do Job.
            // Esta lógica foi parcialmente esboçada no ExecuteTaskUseCase, mas aqui seria mais completa.

            // 1. Marcar Job como EXECUTING (se não estiver já)
            //    Idealmente, o worker/queue manager que chama este service já fez essa transição.
            //    Se não, o ProcessJobService pode ser responsável.
            if (!currentJob.isExecuting() && !currentJob.isFinished() && !currentJob.isFailed() && !currentJob.isCancelled()) {
                // Check if it can transition to EXECUTING (e.g., from PENDING)
                // This assumes Job.start() handles validation and returns a new Job instance
                try {
                    currentJob = currentJob.start(); // Uses JobTimestamp.now() internally
                    const saveResult = await this.jobRepository.save(currentJob);
                    if (saveResult.isError()) {
                        return error(new DomainError(`Failed to update job status to EXECUTING: ${saveResult.message}`));
                    }
                } catch (e) { // Catch DomainError from start() if transition is invalid
                     return error(e instanceof DomainError ? e : new DomainError(`Cannot start job: ${currentJob.id().getValue()}`, e instanceof Error ? e : undefined));
                }
            } else if (currentJob.isFinished() || currentJob.isFailed() || currentJob.isCancelled()) {
                // Job is already in a terminal state, no further processing.
                console.log(`Job ${currentJob.id().getValue()} is already in a terminal state: ${currentJob.getProps().status.getValue()}. Skipping processing.`);
                return ok(currentJob);
            }


            // 2. Obter AgentConfig e AgentRuntimeState para o worker ou job
            //    (Assumindo que Worker ou Job tem uma referência para AgentId, e Worker.agentId / Job.agentId getter/props)
            //    Placeholder: For now, let's assume worker.getAgentId() or similar exists
            //    Or, that the agent to use is determined by the Job context or a routing mechanism.
            //    For this example, let's assume the job implies an agent that can be loaded.
            //    This part needs concrete definition of how Agent is associated or selected.
            //    Let's assume the Job has an agentId field for now, or worker has one.
            //    const agentId = worker.getProps().agentId || currentJob.getProps().agentId; // Example
            // 2. Obter AgentConfig e AgentRuntimeState
            // Assuming JobProps has agentId. If not, this logic needs adjustment
            // (e.g., worker has an agentId, or a more complex lookup is needed).
            const agentIdVo = currentJob.getProps().agentId;
            if (!agentIdVo) {
                return error(new DomainError(`Job ${currentJob.id().getValue()} does not have an associated agentId.`));
            }

            const agentConfigResult = await this.agentRepository.load(agentIdVo);
            if (agentConfigResult.isError()) {
                return error(new DomainError(`Failed to load agent configuration for agent ${agentIdVo.getValue()}: ${agentConfigResult.message}`));
            }
            const agentConfig = agentConfigResult.value;
            if (!agentConfig) {
                return error(new DomainError(`Agent configuration not found for agent ${agentIdVo.getValue()}`));
            }

            let runtimeState: AgentRuntimeState;
            const runtimeStateResult = await this.agentRuntimeStateRepository.load(agentIdVo);
            if (runtimeStateResult.isError()) {
                // Log the error but proceed to create a new state if not found (e.g. first run for agent)
                console.warn(`Could not load runtime state for agent ${agentIdVo.getValue()}: ${runtimeStateResult.message}. Creating new state.`);
                 runtimeState = AgentRuntimeState.create({ agentId: agentIdVo }); // Requires AgentRuntimeState.create to handle defaults
                 // Attempt to save the newly created initial state
                 const initialSaveStateResult = await this.agentRuntimeStateRepository.save(runtimeState);
                 if (initialSaveStateResult.isError()) {
                     return error(new DomainError(`Failed to save initial runtime state for agent ${agentIdVo.getValue()}: ${initialSaveStateResult.message}`));
                 }
            } else {
                runtimeState = runtimeStateResult.value;
                 if (!runtimeState) { // If load can return ok(null)
                    runtimeState = AgentRuntimeState.create({ agentId: agentIdVo });
                    const initialSaveStateResult = await this.agentRuntimeStateRepository.save(runtimeState);
                    if (initialSaveStateResult.isError()) {
                        return error(new DomainError(`Failed to save initial runtime state for agent ${agentIdVo.getValue()}: ${initialSaveStateResult.message}`));
                    }
                }
            }

            // 3. Chamar agentService.executeNextStep
            const stepResult = await this.agentService.executeNextStep(agentConfig, runtimeState, currentJob);

            if (stepResult.isError()) {
                // Agent step failed, mark job as FAILED and save.
                // The error from stepResult might contain more specific info about why it failed.
                console.error(`Agent step execution failed for job ${currentJob.id().getValue()}: ${stepResult.message.message}`);
                currentJob = currentJob.fail(JobTimestamp.now());
                await this.jobRepository.save(currentJob); // Save the FAILED state
                return error(stepResult.message); // Return the error from the agent step
            }

            const { updatedJob: updatedJobFromAgent, updatedRuntimeState } = stepResult.value;
            currentJob = updatedJobFromAgent; // Update currentJob with the version from AgentService

            // 4. Salvar estados atualizados
            // TODO: Consider a unit of work/transaction here for atomicity
            const saveJobRes = await this.jobRepository.save(currentJob);
            if (saveJobRes.isError()) {
                return error(new DomainError(`Failed to save updated job state: ${saveJobRes.message}`));
            }
            const saveStateRes = await this.agentRuntimeStateRepository.save(updatedRuntimeState);
            if (saveStateRes.isError()) {
                // Potentially roll back job save or handle inconsistency
                return error(new DomainError(`Failed to save updated agent runtime state: ${saveStateRes.message}`));
            }

            // 5. Lidar com o status final do Job e Fila
            if (currentJob.isPending() || (currentJob.isDelayed() /* && delay_has_expired - logic for this not here yet */) ) {
                const enqueueResult = await this.jobQueue.addJob(currentJob);
                if (enqueueResult.isError()){
                    console.warn(`Failed to re-enqueue job ${currentJob.id().getValue()}: ${enqueueResult.message}`);
                    // Continue, as job state is saved. Queueing is a separate concern.
                }
            } else if (currentJob.isFailed() && currentJob.canBeRetried()) {
                // Logic for initiating a retry (e.g., creating a new job or specific retry mechanism)
                // For now, it's just saved as FAILED. A separate process could pick it up.
                console.log(`Job ${currentJob.id().getValue()} failed and can be retried. Current attempts: ${currentJob.getProps().attempts.getValue()}`);
            } else if (currentJob.isFinished()) {
                console.log(`Job ${currentJob.id().getValue()} finished successfully.`);
                // Potentially trigger dependent jobs, notifications, etc.
            }

            return ok(currentJob);

        } catch (e) {
            console.error(`Error in ProcessJobServiceImpl.process for job ${job.id().getValue()}:`, e);
            const domainError = e instanceof DomainError ? e : new DomainError("Failed to process job.", e instanceof Error ? e : undefined);
            // Optionally, mark job as FAILED here before returning error
            // let failedJob = job.fail(); // This creates a new instance
            // await this.jobRepository.save(failedJob);
            return error(domainError);
        }
    }

    async executeJob(job: Job): Promise<Result<void>> {
        // TODO: Implementar ou clarificar o propósito deste método.
        // - Could it find an available worker and then call process(job, worker)?
        // - Or is it a more direct execution path that bypasses typical worker assignment?
        // For now, it's a placeholder.
        console.log(`ProcessJobServiceImpl.executeJob called for Job: ${job.id().getValue()}`);
        // Example: const findWorkerResult = await this.workerAssignmentService.findAvailableWorkerForJob(job);
        // if (findWorkerResult.isError()) return error(findWorkerResult.message);
        // const worker = findWorkerResult.value;
        // if (!worker) return error(new DomainError("No available worker for job"));
        // const processResult = await this.process(job, worker);
        // if (processResult.isError()) return error(processResult.message);

        // Use workerAssignmentService to find an available worker
        const findWorkerResult = await this.workerAssignmentService.findAvailableWorker();
        if (findWorkerResult.isError()) {
            return error(new DomainError(`Failed to find available worker for executeJob: ${findWorkerResult.message}`));
        }
        const availableWorker = findWorkerResult.value;

        if (!availableWorker) {
            return error(new DomainError("No available worker found to execute job via executeJob."));
        }

        // The found worker is available but not yet "allocated" (marked busy for this job).
        // The `process` method expects a worker that is ready to process THIS job.
        // The `assignWorker` method in WorkerAssignmentService loads a specific worker AND allocates it.
        // Here, we found an available one. We should now "assign" it to this job context.
        // This might mean calling assignWorker on the found worker's ID,
        // or ProcessJobService.process should handle a worker that is just "available".
        // For now, let's assume process() can take an available worker and its first step is allocation if needed.
        // Or, more correctly, assign it first.

        const assignedWorkerResult = await this.workerAssignmentService.assignWorker(availableWorker.id());
        if (assignedWorkerResult.isError()){
             // Could not allocate the found available worker (e.g. race condition, status changed)
            return error(new DomainError(`Failed to assign found available worker ${availableWorker.id().getValue()}: ${assignedWorkerResult.message}`));
        }
        const assignedWorker = assignedWorkerResult.value;

        console.log(`Assigned worker ${assignedWorker.id().getValue()} to job ${job.id().getValue()} via executeJob.`);
        const processResult = await this.process(job, assignedWorker);

        if (processResult.isError()) {
            return error(processResult.message); // Propagate the error from process()
        }
        return ok(undefined); // process() returns Result<Job>, executeJob returns Result<void>
    }
}
