import { Task } from '../entities/task.entity';

export interface TaskRepository {
  /**
   * Salva uma tarefa no banco de dados
   */
  save(task: Task): Promise<void>;

  /**
   * Busca uma tarefa pelo ID
   */
  findById(id: string): Promise<Task | null>;

  /**
   * Busca todas as tarefas de um projeto
   */
  findByProjectId(projectId: string): Promise<Task[]>;

  /**
   * Busca tarefas atribuídas a um agente específico
   */
  findByAgentId(agentId: string): Promise<Task[]>;

  /**
   * Busca próxima tarefa na fila para um agente (por prioridade)
   */
  getNextTaskInQueue(agentId?: string): Promise<Task | null>;

  /**
   * Busca tarefas por status
   */
  findByStatus(status: Task['props']['status']): Promise<Task[]>;

  /**
   * Busca tarefas por prioridade
   */
  findByPriority(priority: Task['props']['priority']): Promise<Task[]>;

  /**
   * Lista todas as tarefas com paginação
   */
  findAll(page?: number, limit?: number): Promise<{
    tasks: Task[];
    total: number;
    page: number;
    limit: number;
  }>;

  /**
   * Atualiza uma tarefa existente
   */
  update(task: Task): Promise<void>;

  /**
   * Remove uma tarefa
   */
  delete(id: string): Promise<void>;

  /**
   * Busca tarefas filhas de uma tarefa pai
   */
  findSubtasks(parentTaskId: string): Promise<Task[]>;

  /**
   * Busca dependências de uma tarefa
   */
  findTaskDependencies(taskId: string): Promise<Task[]>;

  /**
   * Verifica se uma tarefa pode ser iniciada (não tem dependências pendentes)
   */
  canTaskBeStarted(taskId: string): Promise<boolean>;

  /**
   * Conta tarefas por status para um projeto
   */
  countTasksByStatus(projectId: string): Promise<Record<string, number>>;
}