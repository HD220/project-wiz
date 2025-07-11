import { Task } from '../../domain/entities/task.entity';
import { TaskRepository } from '../../domain/repositories/task.repository';
import { EventBus } from '@/main/kernel/event-bus';
import logger from '@/main/logger';

export interface TaskQueueService {
  enqueueTask(task: Task): Promise<void>;
  dequeueNextTask(agentId?: string): Promise<Task | null>;
  completeTask(taskId: string): Promise<void>;
  failTask(taskId: string, errorMessage: string): Promise<void>;
  getTaskStatus(taskId: string): Promise<Task | null>;
  getQueuedTasksCount(agentId?: string): Promise<number>;
}

export class TaskQueueServiceImpl implements TaskQueueService {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly eventBus: EventBus
  ) {}

  async enqueueTask(task: Task): Promise<void> {
    try {
      await this.taskRepository.save(task);
      
      logger.info('Task enqueued', {
        taskId: task.id,
        title: task.title,
        priority: task.priority,
        assignedAgentId: task.assignedAgentId,
      });

      // Publicar evento de tarefa enfileirada
      this.eventBus.publish('task.enqueued', {
        taskId: task.id,
        agentId: task.assignedAgentId,
        priority: task.priority,
        title: task.title,
      });
    } catch (error) {
      logger.error('Failed to enqueue task', {
        taskId: task.id,
        error: error.message,
      });
      throw error;
    }
  }

  async dequeueNextTask(agentId?: string): Promise<Task | null> {
    try {
      const task = await this.taskRepository.getNextTaskInQueue(agentId);
      
      if (task) {
        // Verificar se a tarefa pode ser iniciada (dependências)
        const canStart = await this.taskRepository.canTaskBeStarted(task.id);
        
        if (!canStart) {
          logger.debug('Task has pending dependencies, skipping', {
            taskId: task.id,
            agentId,
          });
          return null;
        }

        // Marcar como em progresso
        task.markAsInProgress();
        await this.taskRepository.update(task);

        logger.info('Task dequeued and started', {
          taskId: task.id,
          agentId,
          title: task.title,
        });

        // Publicar evento de início de tarefa
        this.eventBus.publish('task.started', {
          taskId: task.id,
          agentId,
          title: task.title,
        });

        return task;
      }

      return null;
    } catch (error) {
      logger.error('Failed to dequeue task', {
        agentId,
        error: error.message,
      });
      throw error;
    }
  }

  async completeTask(taskId: string): Promise<void> {
    try {
      const task = await this.taskRepository.findById(taskId);
      
      if (!task) {
        throw new Error(`Task not found: ${taskId}`);
      }

      task.markAsCompleted();
      await this.taskRepository.update(task);

      logger.info('Task completed', {
        taskId: task.id,
        title: task.title,
        agentId: task.assignedAgentId,
      });

      // Publicar evento de conclusão de tarefa
      this.eventBus.publish('task.completed', {
        taskId: task.id,
        agentId: task.assignedAgentId,
        title: task.title,
        result: 'Task completed successfully',
      });
    } catch (error) {
      logger.error('Failed to complete task', {
        taskId,
        error: error.message,
      });
      throw error;
    }
  }

  async failTask(taskId: string, errorMessage: string): Promise<void> {
    try {
      const task = await this.taskRepository.findById(taskId);
      
      if (!task) {
        throw new Error(`Task not found: ${taskId}`);
      }

      task.markAsFailed();
      await this.taskRepository.update(task);

      logger.error('Task failed', {
        taskId: task.id,
        title: task.title,
        agentId: task.assignedAgentId,
        errorMessage,
      });

      // Publicar evento de falha de tarefa
      this.eventBus.publish('task.failed', {
        taskId: task.id,
        agentId: task.assignedAgentId,
        title: task.title,
        error: errorMessage,
      });
    } catch (error) {
      logger.error('Failed to mark task as failed', {
        taskId,
        error: error.message,
      });
      throw error;
    }
  }

  async getTaskStatus(taskId: string): Promise<Task | null> {
    try {
      return await this.taskRepository.findById(taskId);
    } catch (error) {
      logger.error('Failed to get task status', {
        taskId,
        error: error.message,
      });
      throw error;
    }
  }

  async getQueuedTasksCount(agentId?: string): Promise<number> {
    try {
      const pendingTasks = await this.taskRepository.findByStatus('pending');
      
      if (agentId) {
        return pendingTasks.filter(task => task.assignedAgentId === agentId).length;
      }
      
      return pendingTasks.length;
    } catch (error) {
      logger.error('Failed to get queued tasks count', {
        agentId,
        error: error.message,
      });
      throw error;
    }
  }

  // Método utilitário para reprocessar tarefas falhadas
  async retryFailedTask(taskId: string): Promise<void> {
    try {
      const task = await this.taskRepository.findById(taskId);
      
      if (!task) {
        throw new Error(`Task not found: ${taskId}`);
      }

      if (task.status !== 'failed') {
        throw new Error(`Task ${taskId} is not in failed status`);
      }

      // Resetar status para pending
      (task.props as any).status = 'pending';
      (task.props as any).startedAt = undefined;
      (task.props as any).progressPercentage = 0;
      (task.props as any).updatedAt = new Date();

      await this.taskRepository.update(task);

      logger.info('Failed task retried', {
        taskId: task.id,
        title: task.title,
      });

      // Publicar evento de retry
      this.eventBus.publish('task.retried', {
        taskId: task.id,
        title: task.title,
      });
    } catch (error) {
      logger.error('Failed to retry task', {
        taskId,
        error: error.message,
      });
      throw error;
    }
  }

  // Método para cancelar tarefa
  async cancelTask(taskId: string): Promise<void> {
    try {
      const task = await this.taskRepository.findById(taskId);
      
      if (!task) {
        throw new Error(`Task not found: ${taskId}`);
      }

      task.cancel();
      await this.taskRepository.update(task);

      logger.info('Task cancelled', {
        taskId: task.id,
        title: task.title,
        agentId: task.assignedAgentId,
      });

      // Publicar evento de cancelamento
      this.eventBus.publish('task.cancelled', {
        taskId: task.id,
        agentId: task.assignedAgentId,
        title: task.title,
      });
    } catch (error) {
      logger.error('Failed to cancel task', {
        taskId,
        error: error.message,
      });
      throw error;
    }
  }
}