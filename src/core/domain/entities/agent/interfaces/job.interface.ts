export type JobStatus =
  | "waiting"
  | "delayed"
  | "success"
  | "failed"
  | "executing";

export interface Job {
  id: string;
  name: string;
  payload: any;
  data: any;
  result: any;
  status: JobStatus;
  depends_on: string[];
  max_attempts: number;
  attempts: number;
  priority: number;
  delay: number;
  max_retry_delay: number;
  retry_delay: number;
  created_at: Date;
  updated_at: Date;
}
