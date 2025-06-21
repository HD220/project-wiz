export type TaskStatus = "pending" | "running" | "completed" | "failed";

export interface Task {
  id: string;
  payload: unknown;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
}
