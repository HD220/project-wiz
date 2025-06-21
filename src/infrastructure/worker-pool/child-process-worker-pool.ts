// src/infrastructure/worker-pool/child-process-worker-pool.ts
import { Result, ok, error } from '@/shared/result';
import { IWorkerPool } from '@/core/application/ports/worker-pool.interface'; // Adjusted path
import { DomainError } from '@/core/common/errors';
import { fork, ChildProcess } from 'child_process';
import * as path from 'path';
import * as os from 'os'; // Import os for cpus().length

// Path to the worker script.
// This assumes that after TypeScript compilation, the worker script will be in:
// ./dist/infrastructure/workers/job-processor.worker.js
// Adjust if your build output structure or execution method (e.g., ts-node) is different.
const WORKER_SCRIPT_PATH = path.join(
    __dirname, // Current directory (e.g., infrastructure/worker-pool)
    '../workers/job-processor.worker.js' // Path relative to this file after compilation
);
// For local ts-node execution, you might use:
// const WORKER_SCRIPT_PATH = path.resolve(process.cwd(), 'src/infrastructure/workers/job-processor.worker.ts');


import { IJobQueue } from '@/core/application/ports/job-queue.interface';
import { Job } from '@/core/domain/entities/job/job.entity'; // For Job.toPlainObject()
import { JobId } from '@/core/domain/entities/job/value-objects'; // For associating job with worker

// Extend ChildProcess to track job and index
interface ManagedWorker extends ChildProcess {
    workerIndex?: number;
    currentJobId?: string | null; // Store primitive JobId string
}

export class ChildProcessWorkerPool implements IWorkerPool {
    private workers: ManagedWorker[] = [];
    private maxWorkers: number;
    private isShuttingDown: boolean = false;
    private jobCheckInterval: NodeJS.Timeout | null = null;
    private readonly jobCheckIntervalMs = 3000; // Check for new jobs every 3 seconds

    constructor(
        private readonly jobQueue: IJobQueue, // Now first and mandatory
        numWorkers?: number
    ) {
        this.maxWorkers = numWorkers || Math.max(1, os.cpus().length - 1);
        console.log(`ChildProcessWorkerPool initialized with max ${this.maxWorkers} workers.`);
        console.log(`Expecting worker script at: ${WORKER_SCRIPT_PATH}`);
        if (!this.jobQueue) {
            console.warn("ChildProcessWorkerPool: JobQueue not provided. Pool will not automatically distribute jobs.");
        }
    }

    async start(): Promise<Result<void>> {
        if (this.workers.some(w => w?.connected)) {
            return error(new DomainError("Worker pool already started or has active workers."));
        }
        this.isShuttingDown = false;
        this.workers = new Array(this.maxWorkers).fill(null).map((_, i) => this.spawnWorker(i));

        if (this.jobQueue) {
            this.jobCheckInterval = setInterval(() => {
                if (!this.isShuttingDown) {
                    this.distributeJob();
                }
            }, this.jobCheckIntervalMs);
            console.log(`Worker pool started with ${this.maxWorkers} workers. Polling for jobs enabled.`);
        } else {
            console.log(`Worker pool started with ${this.maxWorkers} workers. Manual job distribution required (no JobQueue).`);
        }
        return ok(undefined);
    }

    private spawnWorker(workerIndex: number): ManagedWorker {
        if (this.isShuttingDown) {
            console.log(`Worker ${workerIndex} not spawned: pool is shutting down.`);
            return null as any; // Should ideally not happen if start() checks this
        }

        try {
            const workerProcess = fork(WORKER_SCRIPT_PATH, [], { stdio: ['ipc', 'inherit', 'inherit'] }) as ManagedWorker;
            workerProcess.workerIndex = workerIndex;
            workerProcess.currentJobId = null;

            workerProcess.on('message', (message: any) => {
                console.log(`Message from worker ${workerIndex} (PID: ${workerProcess.pid}):`, message);
                if (message.type === 'JOB_COMPLETED' || message.type === 'JOB_FAILED') {
                    console.log(`Worker ${workerIndex} (PID: ${workerProcess.pid}) finished job ${message.jobId}. Status: ${message.type}`);
                    if (workerProcess.currentJobId === message.jobId) {
                        workerProcess.currentJobId = null; // Mark as idle
                    }
                    // Attempt to distribute another job immediately if one is waiting
                    if (this.jobQueue && !this.isShuttingDown) this.distributeJob();
                } else if (message.type === 'WORKER_BUSY') {
                     console.warn(`Worker ${workerIndex} reported busy for job ${message.jobId}. This might indicate a race condition or worker issue.`);
                     // Pool should ideally not send a job to a worker it thinks is busy.
                     // If worker self-reports busy, ensure pool's state is consistent.
                     workerProcess.currentJobId = message.jobId; // Sync state
                }
            });

            workerProcess.on('error', (err) => {
                console.error(`Error in worker ${workerIndex} (PID: ${workerProcess.pid}):`, err);
            });

            workerProcess.on('exit', (code, signal) => {
                this.handleWorkerExit(workerIndex, workerProcess.pid, code, signal);
            });

            console.log(`Worker ${workerIndex} spawned (PID: ${workerProcess.pid})`);
            return workerProcess;

        } catch (spawnError) {
            console.error(`Failed to spawn worker ${workerIndex} from script ${WORKER_SCRIPT_PATH}:`, spawnError);
            this.handleWorkerExit(workerIndex, null, 'spawn_error', null); // Attempt respawn or mark as error
            return null as any; // Indicate failure to spawn
        }
    }

    private findIdleWorker(): ManagedWorker | undefined {
        return this.workers.find(w => w && w.connected && !w.currentJobId);
    }

    private async distributeJob(): Promise<void> {
        if (this.isShuttingDown || !this.jobQueue) return;

        const idleWorker = this.findIdleWorker();
        if (!idleWorker) {
            // console.log("No idle workers available currently.");
            return;
        }

        try {
            const jobResult = await this.jobQueue.getNextJob();
            if (jobResult.isError() || !jobResult.value) {
                if (jobResult.isError()) console.error("Error fetching job from queue:", jobResult.message);
                // else console.log("No jobs in queue.");
                return;
            }

            const job = jobResult.value;
            const plainJobData = job.toPlainObject(); // Requires Job to have toPlainObject()

            console.log(`Distributing job ${job.id().getValue()} to worker ${idleWorker.workerIndex} (PID: ${idleWorker.pid})`);
            idleWorker.currentJobId = job.id().getValue(); // Mark as busy with this job
            idleWorker.send({ type: 'PROCESS_JOB', jobData: plainJobData });

        } catch (e) {
            console.error("Error in distributeJob:", e);
        }
    }


    private handleWorkerExit(workerIndex: number, pid: number | null | undefined, code: number | null, signal: string | null): void {
        console.log(`Worker ${workerIndex} (PID: ${pid || 'N/A'}) exited with code ${code}, signal ${signal}. CurrentJobId: ${this.workers[workerIndex]?.currentJobId}`);

        // TODO: Handle re-queuing or marking as failed for this.workers[workerIndex]?.currentJobId if it was processing one.

        this.workers[workerIndex] = null; // Mark as dead/gone

        // Simplified: No automatic respawn for now. Pool will degrade.
        // Respawn logic could be added here if desired and !this.isShuttingDown
        if (!this.isShuttingDown) {
             console.log(`Worker ${workerIndex} exited. Automatic respawn disabled for now.`);
             // To re-enable: setTimeout(() => this.spawnWorker(workerIndex), 1000);
        }
    }

    async shutdown(): Promise<Result<void>> {
        console.log("Shutting down worker pool...");
        this.isShuttingDown = true;

        const shutdownPromises = this.workers.map((worker, index) => {
            if (worker && worker.connected) {
                return new Promise<void>((resolve) => {
                    let resolved = false;
                    const handleExit = () => {
                        if (!resolved) {
                            resolved = true;
                            console.log(`Worker ${index} (PID: ${worker.pid}) has shutdown.`);
                            clearTimeout(timeoutId);
                            resolve();
                        }
                    };

                    worker.on('exit', handleExit);

                    // Send shutdown message
                    if (worker.connected) { // Check again before send
                        worker.send({ type: 'SHUTDOWN' });
                    }

                    const timeoutId = setTimeout(() => {
                        if (worker.connected) {
                            console.warn(`Worker ${index} (PID: ${worker.pid}) did not shutdown gracefully, killing (SIGTERM).`);
                            worker.kill('SIGTERM');
                            // Give it a moment to die from SIGTERM before potential SIGKILL
                            setTimeout(() => {
                                if (worker.connected) {
                                    console.warn(`Worker ${index} (PID: ${worker.pid}) still alive, killing (SIGKILL).`);
                                    worker.kill('SIGKILL');
                                }
                                handleExit(); // Ensure resolution
                            }, 1000);
                        } else {
                           handleExit(); // Already exited
                        }
                    }, 3000); // Reduced timeout for graceful shutdown attempt
                });
            }
            return Promise.resolve();
        });

        try {
            await Promise.all(shutdownPromises);
        } catch (e) {
            // Should not happen if individual promises handle their errors and resolve
            console.error("Error during Promise.all in shutdown:", e);
        }

        this.workers = [];
        console.log("Worker pool shutdown sequence complete.");
        return ok(undefined);
    }
}
