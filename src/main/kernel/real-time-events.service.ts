import { webContents } from 'electron';
import { EventBus } from './event-bus';
import logger from '../logger';

export class RealTimeEventsService {
  constructor(private readonly eventBus: EventBus) {
    this.setupEventListeners();
  }

  async broadcastToChannel(channelId: string, event: any): Promise<void> {
    const payload = {
      type: 'channel_event',
      channelId,
      event,
      timestamp: Date.now(),
    };

    // Enviar para todas as janelas abertas
    this.sendToAllWindows('real-time-event', payload);

    logger.debug('Event broadcasted to channel', { channelId, eventType: event.type });
  }

  async sendToUser(userId: string, event: any): Promise<void> {
    const payload = {
      type: 'user_event',
      userId,
      event,
      timestamp: Date.now(),
    };

    this.sendToAllWindows('real-time-event', payload);

    logger.debug('Event sent to user', { userId, eventType: event.type });
  }

  async notifyAgentProgress(agentId: string, progress: any): Promise<void> {
    const event = {
      type: 'agent_progress',
      agentId,
      progress,
      timestamp: Date.now(),
    };

    await this.broadcastToChannel('system', event);
  }

  async notifyNewMessage(channelId: string, message: any): Promise<void> {
    const event = {
      type: 'new_message',
      channelId,
      message,
      timestamp: Date.now(),
    };

    await this.broadcastToChannel(channelId, event);
  }

  async notifyTaskUpdate(taskId: string, taskData: any): Promise<void> {
    const event = {
      type: 'task_update',
      taskId,
      taskData,
      timestamp: Date.now(),
    };

    this.sendToAllWindows('real-time-event', {
      type: 'system_event',
      event,
      timestamp: Date.now(),
    });
  }

  async notifyAgentStatusChange(agentId: string, status: string, metadata?: any): Promise<void> {
    const event = {
      type: 'agent_status_change',
      agentId,
      status,
      metadata,
      timestamp: Date.now(),
    };

    this.sendToAllWindows('real-time-event', {
      type: 'system_event',
      event,
      timestamp: Date.now(),
    });
  }

  private sendToAllWindows(channel: string, data: any): void {
    try {
      webContents.getAllWebContents().forEach((contents) => {
        if (!contents.isDestroyed()) {
          contents.send(channel, data);
        }
      });
    } catch (error: any) {
      logger.error('Failed to send message to renderer processes', {
        channel,
        error: error.message,
      });
    }
  }

  private setupEventListeners(): void {
    // Escutar eventos de agentes
    this.eventBus.subscribe('agent.progress', async (event: any) => {
      await this.notifyAgentProgress(event.agentId, event);
    });

    this.eventBus.subscribe('agent.task_completed', async (event: any) => {
      await this.notifyAgentProgress(event.agentId, {
        type: 'task_completed',
        taskId: event.taskId,
        result: event.result,
      });
    });

    this.eventBus.subscribe('agent.error', async (event: any) => {
      await this.notifyAgentStatusChange(event.agentId, 'error', {
        error: event.error,
      });
    });

    this.eventBus.subscribe('agent.started', async (event: any) => {
      await this.notifyAgentStatusChange(event.agentId, 'started', {
        workerId: event.workerId,
        name: event.name,
      });
    });

    this.eventBus.subscribe('agent.stopped', async (event: any) => {
      await this.notifyAgentStatusChange(event.agentId, 'stopped');
    });

    this.eventBus.subscribe('agent.status_update', async (event: any) => {
      await this.notifyAgentStatusChange(event.agentId, event.status, {
        taskId: event.taskId,
      });
    });

    this.eventBus.subscribe('agent.log', async (event: any) => {
      await this.notifyAgentProgress(event.agentId, {
        type: 'log',
        level: event.level,
        message: event.message,
        metadata: event.metadata,
        timestamp: event.timestamp,
      });
    });

    // Escutar eventos de tarefas
    this.eventBus.subscribe('task.enqueued', async (event: any) => {
      await this.notifyTaskUpdate(event.taskId, {
        type: 'enqueued',
        agentId: event.agentId,
        priority: event.priority,
        title: event.title,
      });
    });

    this.eventBus.subscribe('task.started', async (event: any) => {
      await this.notifyTaskUpdate(event.taskId, {
        type: 'started',
        agentId: event.agentId,
        title: event.title,
      });
    });

    this.eventBus.subscribe('task.completed', async (event: any) => {
      await this.notifyTaskUpdate(event.taskId, {
        type: 'completed',
        agentId: event.agentId,
        title: event.title,
        result: event.result,
      });
    });

    this.eventBus.subscribe('task.failed', async (event: any) => {
      await this.notifyTaskUpdate(event.taskId, {
        type: 'failed',
        agentId: event.agentId,
        title: event.title,
        error: event.error,
      });
    });

    this.eventBus.subscribe('task.cancelled', async (event: any) => {
      await this.notifyTaskUpdate(event.taskId, {
        type: 'cancelled',
        agentId: event.agentId,
        title: event.title,
      });
    });

    this.eventBus.subscribe('task.retried', async (event: any) => {
      await this.notifyTaskUpdate(event.taskId, {
        type: 'retried',
        title: event.title,
      });
    });

    logger.info('Real-time events service initialized');
  }

  // Método para notificar sobre eventos personalizados
  async notifyCustomEvent(eventType: string, data: any, targetChannel?: string): Promise<void> {
    const event = {
      type: eventType,
      data,
      timestamp: Date.now(),
    };

    if (targetChannel) {
      await this.broadcastToChannel(targetChannel, event);
    } else {
      this.sendToAllWindows('real-time-event', {
        type: 'custom_event',
        event,
        timestamp: Date.now(),
      });
    }
  }

  // Método para testar conectividade
  async ping(): Promise<void> {
    this.sendToAllWindows('real-time-event', {
      type: 'ping',
      timestamp: Date.now(),
    });

    logger.debug('Ping sent to all renderer processes');
  }
}