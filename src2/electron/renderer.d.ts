import type { NewJob, Job } from '../core/domain/schemas'; // Caminho relativo a esta pasta (electron)

export interface IElectronAPI {
  queueAddJob: (jobData: NewJob) => Promise<{success: boolean, job?: Job, error?: string}>,
  queueGetNextJob: (criteria?: { personaId?: string; excludedIds?: string[] }) => Promise<{success: boolean, job?: Job | null, error?: string}>,
  queueCompleteJob: (jobId: string, result: any) => Promise<{success: boolean, job?: Job | null, error?: string}>,
  queueFailJob: (jobId: string, reason: string) => Promise<{success: boolean, job?: Job | null, error?: string}>,
}

declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}
