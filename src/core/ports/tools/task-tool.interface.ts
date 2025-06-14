import { z } from "zod";

/**
 * Interface simplificada para gerenciamento de Tasks em memória
 * Seguindo os princípios da Clean Architecture
 */
export interface TaskTool {
  /**
   * Adiciona uma nova Task para processamento
   * @param payload Dados necessários para execução da Task
   * @returns ID da Task criada
   */
  addTask(payload: unknown): Promise<string>;

  /**
   * Obtém a próxima Task disponível para execução
   * @returns Task ou null se não houver Tasks pendentes
   */
  getNextTask(): Promise<Task | null>;

  /**
   * Atualiza o status de uma Task
   * @param taskId ID da Task
   * @param status Novo status
   */
  updateTaskStatus(taskId: string, status: TaskStatus): Promise<void>;
}

export const TaskStatusSchema = z.enum(["pending", "running", "completed"]);

export type TaskStatus = z.infer<typeof TaskStatusSchema>;

export interface Task {
  id: string;
  jobId: string;
  status: TaskStatus;
  payload: unknown;
  createdAt: number;
  updatedAt: number;
}
