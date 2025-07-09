import { eventBus } from './EventBus'; // Adjusted path, assuming EventBus.ts is in the same utils directory

// Define more specific job statuses if needed, aligning with what EventBus might send
export type JobStatus = 'Pending' | 'InProgress' | 'Completed' | 'Failed' | 'Paused' | 'Cancelled';

export interface MockJob {
  id: string;
  name: string;
  status: JobStatus;
}

export const sendJobCommand = async (jobId: string, action: 'pause' | 'cancel'): Promise<void> => {
  console.log(`Attempting to ${action} job ${jobId}`);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < 0.8) { // 80% success rate
        console.log(`Job ${jobId} action ${action} successful (simulated)`);

        // Determine the new status based on the action
        const newStatus: JobStatus = action === 'pause' ? 'Paused' : 'Cancelled';

        // In a real scenario, the backend would process this and then an event would be emitted.
        // We simulate this by emitting an event directly.
        // We need to ensure the job name is preserved or retrieved if not available here.
        // For simulation, we'll just update status. A real event might carry the full job object.
        eventBus.emit('job-updated', {
          id: jobId,
          // IMPORTANT: The name of the job should ideally be part of the event data.
          // For this mock, we'll assume the dashboard has the name and only updates based on ID and new status.
          // Or, if the event is meant to replace the job object entirely, it should include all fields.
          // Let's assume the event provides the full job object structure.
          name: `Job ${jobId}`, // This might be stale if name changes elsewhere.
          status: newStatus
        } as MockJob);
        resolve();
      } else {
        console.error(`Failed to ${action} job ${jobId} (simulated)`);
        reject(new Error(`Simulated error: Could not ${action} job.`));
      }
    }, 500);
  });
};
