// src/infrastructure/workers/job-processor.worker.ts
import { v4 as uuidv4 } from 'uuid';
import { WorkerRequest, WorkerResponse, isWorkerResponse } from '../../shared/ipc-types'; // Adjusted path
import { Result, ok, error } from '../../shared/result'; // Ensure Result, ok, error are correctly imported
import { DomainError } from '../../core/common/errors';

// --- Entity & VO Imports (needed for rehydration function signatures & stubs) ---
import { Job, JobProps } from '../../core/domain/entities/job/job.entity'; // Adjusted path
import { JobBuilder } from '../../core/domain/entities/job/job-builder'; // Adjusted path
import {
    JobId, JobName, JobStatus, AttemptCount, JobTimestamp, RetryPolicy, NoRetryPolicy, ActivityContext, ActivityType, JobPriority, JobDependsOn, RelatedActivityIds, ActivityHistory, ActivityHistoryEntry, ActivityNotes
} from '../../core/domain/entities/job/value-objects'; // Adjusted path
import { RetryPolicyParams } from '../../core/domain/entities/job/value-objects/retry-policy.vo';
import { ActivityContextPropsInput, ValidationStatusType } from '../../core/domain/entities/job/value-objects/activity-context.vo';
import { JobStatusType } from '../../core/domain/entities/job/value-objects/job-status.vo';

import { Agent, AgentProps } from '../../core/domain/entities/agent/agent.entity';
import { AgentId } from '../../core/domain/entities/agent/value-objects';
import { AgentRuntimeState, AgentRuntimeStateProps } from '../../core/domain/entities/agent/agent-runtime-state.entity';
// Persona, User, Worker, LLMProviderConfig entities/props/IDs would also be imported if their rehydrate functions were fully defined here.
// For now, their stubs use `any` or assumed types for rehydration products.

// --- IPC Service Stubs ---
import { IPCJobRepository } from '../ipc-services/ipc-job-repository';
import { IPCAgentRepository } from '../ipc-services/ipc-agent-repository';
import { IPCAgentRuntimeStateRepository } from '../ipc-services/ipc-agent-runtime-state-repository';
import { IPCLLMProviderConfigRepository } from '../ipc-services/ipc-llm-provider-config-repository';
import { IPCPersonaRepository } from '../ipc-services/ipc-persona-repository';
import { IPCUserRepository } from '../ipc-services/ipc-user-repository';
import { IPCWorkerRepository } from '../ipc-services/ipc-worker-repository';
import { IPCLLMAdapter } from '../ipc-services/ipc-llm-adapter';
import { IPCJobQueueAdapter } from '../ipc-services/ipc-job-queue-adapter';

// --- Real Application Services & Factories ---
import { ProcessJobServiceImpl } from '../../core/application/services/process-job.service';
import { AgentServiceImpl } from '../../core/application/services/agent.service';
import { WorkerAssignmentServiceImpl } from '../../core/application/services/worker-assignment.service';
import { TaskFactoryImpl } from '../../infrastructure/tasks/task.factory'; // Corrected path from core to infrastructure
import { LLMInterface } from '../../core/ports/llm.interface'; // Corrected path
import { ITaskFactory } from '../../core/application/factories/task.factory.interface';


// --- IPC Communication Setup ---
const requestPromises = new Map<string, { resolve: (value: any) => void, reject: (reason?: any) => void }>();

function sendRequestToMain<T_REQ_PAYLOAD, T_RES_DATA>(type: string, payload: T_REQ_PAYLOAD): Promise<T_RES_DATA> {
    return new Promise((resolve, reject) => {
        const requestId = uuidv4();
        requestPromises.set(requestId, { resolve, reject });
        if (!process.send) {
            console.error("WORKER: process.send is not available.");
            requestPromises.delete(requestId); // Clean up
            return reject(new DomainError("IPC channel not available. Worker cannot send requests."));
        }
        process.send({ requestId, type, payload } as WorkerRequest);

        // Optional: Add a timeout for the promise
        const timeoutId = setTimeout(() => {
            if (requestPromises.has(requestId)) {
                requestPromises.delete(requestId);
                reject(new DomainError(`Request ${type} (${requestId}) timed out after 30s`));
            }
        }, 30000); // 30 second timeout

        // Ensure timeout doesn't keep process alive if promise resolves/rejects normally
        // This is implicitly handled by resolve/reject also calling requestPromises.delete(requestId)
    });
}

// --- Rehydration Function (for Job, others declared for IPC stubs) ---
// This is the existing rehydrateJob function, ensure all paths to VOs are correct.
function rehydrateJob(plainJob: any): Job {
    let contextVO: ActivityContext | undefined = undefined;
    if (plainJob.context) {
        let historyVO: ActivityHistory | undefined = undefined;
        if (plainJob.context.activityHistory && Array.isArray(plainJob.context.activityHistory)) {
            const historyEntries = plainJob.context.activityHistory.map((entry: any) =>
                ActivityHistoryEntry.create(entry.role, entry.content, new Date(entry.timestamp))
            );
            historyVO = ActivityHistory.create(historyEntries);
        }
        const notesVO = ActivityNotes.create(plainJob.context.activityNotes || []);
        const contextInput: ActivityContextPropsInput = {
            messageContent: plainJob.context.messageContent,
            sender: plainJob.context.sender,
            toolName: plainJob.context.toolName,
            toolArgs: plainJob.context.toolArgs,
            goalToPlan: plainJob.context.goalToPlan,
            plannedSteps: plainJob.context.plannedSteps,
            validationCriteria: plainJob.context.validationCriteria,
            validationResult: plainJob.context.validationResult as ValidationStatusType,
            activityHistory: historyVO!,
            activityNotes: notesVO,
        };
        contextVO = ActivityContext.create(contextInput);
    }

    let retryPolicyVO: RetryPolicy | NoRetryPolicy;
    if (plainJob.retryPolicy && plainJob.retryPolicy.type === 'NoRetryPolicy') {
        retryPolicyVO = NoRetryPolicy.create();
    } else if (plainJob.retryPolicy) {
        retryPolicyVO = RetryPolicy.create(plainJob.retryPolicy as RetryPolicyParams);
    } else {
        retryPolicyVO = NoRetryPolicy.create();
    }

    // Using JobBuilder as per existing worker code, assuming Job.create is not public.
    let builder = new JobBuilder()
        .withId(JobId.create(plainJob.id))
        .withName(plainJob.name) // JobBuilder's withName takes string
        .withStatus(JobStatus.create(plainJob.status as JobStatusType))
        .withAttempts(AttemptCount.create(plainJob.attempts))
        .withRetryPolicy(retryPolicyVO)
        .withCreatedAt(JobTimestamp.create(new Date(plainJob.createdAt)))
        .withUpdatedAt(plainJob.updatedAt ? JobTimestamp.create(new Date(plainJob.updatedAt)) : undefined)
        .withPayload(plainJob.payload)
        .withMetadata(plainJob.metadata)
        .withData(plainJob.data)
        .withResult(plainJob.result)
        .withPriority(plainJob.priority !== undefined ? JobPriority.create(plainJob.priority) : undefined)
        .withDependsOn(plainJob.dependsOn ? JobDependsOn.create(plainJob.dependsOn.map((id: string) => JobId.create(id))) : undefined)
        .withActivityType(plainJob.activityType ? ActivityType.create(plainJob.activityType) : undefined)
        .withContext(contextVO)
        .withParentId(plainJob.parentId ? JobId.create(plainJob.parentId) : undefined)
        .withRelatedActivityIds(plainJob.relatedActivityIds ? RelatedActivityIds.create(plainJob.relatedActivityIds.map((id: string) => JobId.create(id))) : undefined)
        .withAgentId(plainJob.agentId ? AgentId.create(plainJob.agentId) : undefined);
    return builder.build();
}

// Declare other rehydration functions (implementations would be similar to rehydrateJob)
// These are used by the IPC stubs when they receive plain data from the main process.
declare function rehydrateAgent(plainAgentData: any): Agent;
declare function rehydrateAgentRuntimeState(plainStateData: any): AgentRuntimeState;
// declare function rehydrateLLMProviderConfig(plainConfigData: any): LLMProviderConfig; // From LLMProviderConfig entity
// declare function rehydratePersona(plainPersonaData: any): any; // Using 'any' due to Persona definition issues
// declare function rehydrateUser(plainUserData: any): any; // Using 'any' due to User definition issues
// declare function rehydrateWorker(plainWorkerData: any): Worker; // From Worker entity


// --- Global service instances, initialized by initializeWorker ---
let processJobServiceInstance: ProcessJobServiceImpl;

function initializeServices() {
    // Instantiate IPC-based repositories and adapters
    const jobRepository = new IPCJobRepository();
    const agentRepository = new IPCAgentRepository();
    const agentRuntimeStateRepository = new IPCAgentRuntimeStateRepository();
    const llmProviderConfigRepository = new IPCLLMProviderConfigRepository();
    const personaRepository = new IPCPersonaRepository(); // Uses assumed Persona structure
    const userRepository = new IPCUserRepository();       // Uses assumed User structure
    const workerRepository = new IPCWorkerRepository();
    const llmAdapter = new IPCLLMAdapter();
    const jobQueueForWorker = new IPCJobQueueAdapter(); // For worker-initiated requeue/add

    // Instantiate real TaskFactory (it takes ILLM, so pass the IPC one)
    const taskFactory = new TaskFactoryImpl(llmAdapter);

    // Instantiate real Application Services using IPC stubs
    const agentService = new AgentServiceImpl(llmAdapter, taskFactory);
    const workerAssignmentService = new WorkerAssignmentServiceImpl(workerRepository);

    processJobServiceInstance = new ProcessJobServiceImpl(
        jobRepository,
        jobQueueForWorker, // Note: This is the IPC version for worker's use
        agentService,
        agentRepository,
        agentRuntimeStateRepository,
        workerAssignmentService,
        llmProviderConfigRepository
        // If ProcessJobService needs PersonaRepo or UserRepo, add them here.
    );
    console.log(`Worker (PID: ${process.pid}) services initialized with IPC stubs.`);
}

// --- Message Handling ---
let isShuttingDown = false;
let isProcessingJob = false;

async function handleProcessJobMessage(jobData: any) {
    if (!processJobServiceInstance) {
        console.error("WORKER: ProcessJobService not initialized before receiving job!");
        if (process.send) {
             process.send({ type: 'JOB_FAILED', jobId: jobData.id, error: { message: "Worker services not initialized" } });
        }
        return;
    }

    isProcessingJob = true;
    console.log(`Worker (PID: ${process.pid}) received job to process: ${jobData.id}`);

    let rehydratedJob: Job;
    try {
        rehydratedJob = rehydrateJob(jobData);
    } catch (hydrationError) {
        console.error(`WORKER: Failed to rehydrate job ${jobData.id}:`, hydrationError);
        if (process.send) {
            const err = hydrationError instanceof Error ? hydrationError : new Error(String(hydrationError));
            process.send({ type: 'JOB_FAILED', jobId: jobData.id, error: { message: err.message, name: err.name } });
        }
        isProcessingJob = false;
        return;
    }

    try {
        // ProcessJobServiceImpl.executeJob is expected to run the full job logic
        const result = await processJobServiceInstance.executeJob(rehydratedJob);
        if (process.send) {
            if (result.isOk()) {
                process.send({ type: 'JOB_COMPLETED', jobId: rehydratedJob.id().getValue() });
            } else {
                process.send({ type: 'JOB_FAILED', jobId: rehydratedJob.id().getValue(), error: { message: result.error.message, name: result.error.name } });
            }
        }
    } catch (executionError) {
        console.error(`WORKER: Error during processJobService.executeJob for ${jobData.id}:`, executionError);
        if (process.send) {
            const err = executionError instanceof Error ? executionError : new Error(String(executionError));
            process.send({ type: 'JOB_FAILED', jobId: jobData.id, error: { message: err.message, name: err.name } });
        }
    } finally {
        isProcessingJob = false;
        if (isShuttingDown) {
            console.log(`Worker (PID: ${process.pid}) processed its last job and is shutting down.`);
            process.exit(0);
        }
    }
}

process.on('message', (message: any) => {
    if (isWorkerResponse(message)) { // Handle responses from main process
        const { requestId, success, data, error: errData } = message;
        if (requestPromises.has(requestId)) {
            const { resolve, reject } = requestPromises.get(requestId)!;
            if (success) {
                resolve(data);
            } else {
                const errorToReject = new Error(errData?.message || "Unknown error from main process");
                errorToReject.name = errData?.name || "MainProcessError";
                // errorToReject.stack = errData?.stack; // Stack from main might not be useful
                reject(errorToReject);
            }
            requestPromises.delete(requestId);
        }
    } else if (message && message.type === 'PROCESS_JOB' && message.jobData) {
        if (isShuttingDown) {
            console.log(`Worker (PID: ${process.pid}) is shutting down, ignoring PROCESS_JOB.`);
            return;
        }
        if (isProcessingJob) {
            console.warn(`WORKER: Received new job [${message.jobData.id}] while already processing. This should be handled by the pool.`);
            if (process.send) {
                 process.send({ type: 'WORKER_BUSY', jobId: message.jobData.id, message: "Worker is already processing another job." });
            }
            return;
        }
        handleProcessJobMessage(message.jobData);
    } else if (message && message.type === 'SHUTDOWN') {
        console.log(`Worker (PID: ${process.pid}) SHUTDOWN signal received.`);
        isShuttingDown = true;
        if (!isProcessingJob) {
            console.log(`Worker (PID: ${process.pid}) is idle and shutting down immediately.`);
            process.exit(0);
        } else {
            console.log(`Worker (PID: ${process.pid}) will shut down after current job.`);
        }
    } else {
        console.warn(`Worker (PID: ${process.pid}) received unknown message:`, message);
    }
});

process.on('unhandledRejection', (reason, promise) => {
    console.error(`WORKER (PID: ${process.pid}) Unhandled Rejection at:', promise, 'reason:', reason);
    if (process.send) {
        process.send({ type: 'WORKER_ERROR', error: `Unhandled Rejection: ${reason}` });
    }
});
process.on('uncaughtException', (err, origin) => {
    console.error(`WORKER (PID: ${process.pid}) Uncaught Exception:`, err, 'Origin:', origin);
    if (process.send) {
        process.send({ type: 'WORKER_ERROR', error: `Uncaught Exception: ${err.message}` });
    }
    process.exit(1);
});

// --- Worker Initialization ---
function startWorker() {
    initializeServices(); // Initialize all services that use IPC stubs
    console.log(`Worker (PID: ${process.pid}) is ready and listening for messages.`);
    // Inform the main process that worker is ready (optional)
    if (process.send) {
        process.send({ type: 'WORKER_READY' });
    }
}

startWorker();
