import { Worker } from 'worker_threads';
import path from 'path';
import { EventBus } from '../event-bus';
import { TaskQueueService } from '../../modules/task-management/application/services/task-queue.service';
import { Task } from '../../modules/task-management/domain/entities/task.entity';
import logger from '../../logger';

interface ActiveAgent {
  workerId: string;
  agentId: string;
  worker: Worker | null;
  currentTask?: Task;
  status: 'idle' | 'working' | 'paused' | 'error';
  startedAt: Date;
  lastHeartbeat?: Date;
}

interface AgentConfig {
  id: string;
  name: string;
  role: string;
  systemPrompt: string;
  llmModel: string;
  capabilities: string[];
  maxConcurrentTasks: number;
}

export class AgentRuntimeManager {
  private activeAgents = new Map<string, ActiveAgent>();
  private workerPath = path.join(__dirname, 'agent.worker.js');
  private taskCheckInterval: NodeJS.Timeout | null = null;
  private readonly CHECK_INTERVAL = 5000; // 5 segundos

  constructor(
    private readonly eventBus: EventBus,
    private readonly taskQueueService: TaskQueueService
  ) {
    this.setupEventListeners();
  }

  async startAgent(agentId: string, agentConfig: AgentConfig): Promise<void> {
    if (this.activeAgents.has(agentId)) {
      throw new Error(`Agent ${agentId} is already running`);
    }

    const workerId = `${agentId}-${Date.now()}`;
    
    logger.info('Starting agent', { agentId, workerId, name: agentConfig.name });

    const activeAgent: ActiveAgent = {
      workerId,
      agentId,
      worker: null,
      status: 'idle',
      startedAt: new Date(),
      lastHeartbeat: new Date(),
    };

    this.activeAgents.set(agentId, activeAgent);

    // Iniciar o loop de verificação de tarefas se não estiver rodando
    if (!this.taskCheckInterval) {
      this.startTaskCheckLoop();
    }

    this.eventBus.publish('agent.started', { 
      agentId, 
      workerId, 
      name: agentConfig.name,
      status: 'idle'
    });
  }

  async stopAgent(agentId: string): Promise<void> {
    const activeAgent = this.activeAgents.get(agentId);
    if (!activeAgent) {
      throw new Error(`Agent ${agentId} is not running`);
    }

    logger.info('Stopping agent', { agentId, workerId: activeAgent.workerId });

    if (activeAgent.worker) {
      await activeAgent.worker.terminate();
    }

    this.activeAgents.delete(agentId);
    
    // Parar o loop se não há agentes ativos
    if (this.activeAgents.size === 0 && this.taskCheckInterval) {
      clearInterval(this.taskCheckInterval);
      this.taskCheckInterval = null;
    }

    this.eventBus.publish('agent.stopped', { agentId });
  }

  async assignTaskToAgent(agentId: string, task: Task, agentConfig: AgentConfig): Promise<void> {
    const activeAgent = this.activeAgents.get(agentId);
    if (!activeAgent) {
      throw new Error(`Agent ${agentId} is not running`);
    }

    if (activeAgent.status !== 'idle') {
      throw new Error(`Agent ${agentId} is not available (status: ${activeAgent.status})`);
    }

    await this.executeTaskInWorker(activeAgent, task, agentConfig);
  }

  private async executeTaskInWorker(activeAgent: ActiveAgent, task: Task, agentConfig: AgentConfig): Promise<void> {
    const workerData = {
      agentId: activeAgent.agentId,
      agentConfig: {
        name: agentConfig.name,
        role: agentConfig.role,
        systemPrompt: agentConfig.systemPrompt,
        llmModel: agentConfig.llmModel,
        capabilities: agentConfig.capabilities,
      },
      task: {
        id: task.id,
        title: task.title,
        description: task.description,
        type: task.type,
        priority: task.priority,
      },
      projectPath: '/tmp/project', // TODO: buscar do banco
      worktreePath: '/tmp/worktree', // TODO: criar worktree
    };

    const worker = new Worker(this.workerPath, { workerData });

    activeAgent.worker = worker;
    activeAgent.currentTask = task;
    activeAgent.status = 'working';
    activeAgent.lastHeartbeat = new Date();

    worker.on('message', async (message) => {
      await this.handleWorkerMessage(activeAgent, message);
    });

    worker.on('error', async (error) => {
      await this.handleWorkerError(activeAgent, error);
    });

    worker.on('exit', (code) => {
      this.handleWorkerExit(activeAgent, code);
    });

    logger.info('Task assigned to agent worker', { 
      agentId: activeAgent.agentId, 
      taskId: task.id,
      workerPath: this.workerPath
    });
  }

  private async handleWorkerMessage(activeAgent: ActiveAgent, message: any): Promise<void> {
    const { type, data } = message;

    // Atualizar heartbeat
    activeAgent.lastHeartbeat = new Date();

    switch (type) {
      case 'status':
        await this.handleStatusUpdate(activeAgent, data);
        break;
      case 'progress':
        this.handleProgressUpdate(activeAgent, data);
        break;
      case 'tool_call':
        this.handleToolCall(activeAgent, message);
        break;
      case 'log':
        this.handleLogMessage(activeAgent, data);
        break;
      case 'error':
        await this.handleWorkerError(activeAgent, new Error(data.error));
        break;
      default:
        logger.warn('Unknown worker message type', { type, agentId: activeAgent.agentId });
    }
  }

  private async handleStatusUpdate(activeAgent: ActiveAgent, data: any): Promise<void> {
    const { status, taskId, result } = data;

    if (status === 'completed') {
      await this.taskQueueService.completeTask(taskId);
      activeAgent.status = 'idle';
      activeAgent.currentTask = undefined;
      
      this.eventBus.publish('agent.task_completed', {
        agentId: activeAgent.agentId,
        taskId,
        result,
      });
    } else if (status === 'analyzing' || status === 'planning' || status === 'executing') {
      // Atualizações de status intermediárias
      this.eventBus.publish('agent.status_update', {
        agentId: activeAgent.agentId,
        taskId,
        status,
      });
    }

    logger.info('Agent status update', { 
      agentId: activeAgent.agentId, 
      status, 
      taskId 
    });
  }

  private handleProgressUpdate(activeAgent: ActiveAgent, data: any): void {
    const { taskId, progress, message } = data;

    this.eventBus.publish('agent.progress', {
      agentId: activeAgent.agentId,
      taskId,
      progress,
      message,
    });

    logger.debug('Agent progress update', { 
      agentId: activeAgent.agentId, 
      taskId, 
      progress,
      message 
    });
  }

  private handleLogMessage(activeAgent: ActiveAgent, data: any): void {
    const { level, message, metadata } = data;

    // Usar método de log apropriado baseado no nível
    if (level === 'info') {
      logger.info('Agent log', { agentId: activeAgent.agentId, message, metadata });
    } else if (level === 'error') {
      logger.error('Agent log', { agentId: activeAgent.agentId, message, metadata });
    } else if (level === 'warn') {
      logger.warn('Agent log', { agentId: activeAgent.agentId, message, metadata });
    } else {
      logger.debug('Agent log', { agentId: activeAgent.agentId, message, metadata });
    }

    this.eventBus.publish('agent.log', {
      agentId: activeAgent.agentId,
      level,
      message,
      metadata,
      timestamp: new Date(),
    });
  }

  private handleToolCall(activeAgent: ActiveAgent, message: any): void {
    const { tool, args, id } = message;

    logger.debug('Agent tool call', { 
      agentId: activeAgent.agentId, 
      tool,
      args 
    });

    // TODO: Implementar handlers reais para cada ferramenta
    // Por agora, enviar resposta mock
    this.sendToolResponse(activeAgent, id, this.getMockToolResponse(tool, args));
  }

  private getMockToolResponse(tool: string, args: any): any {
    switch (tool) {
      case 'readFile':
        return `// Mock content of file: ${args.path}`;
      case 'writeFile':
        return { success: true };
      case 'listDirectory':
        return ['src', 'package.json', 'README.md'];
      case 'executeShell':
        return { stdout: 'Command executed successfully', stderr: '', exitCode: 0 };
      default:
        return { error: `Unknown tool: ${tool}` };
    }
  }

  private sendToolResponse(activeAgent: ActiveAgent, id: string, result: any): void {
    if (activeAgent.worker) {
      activeAgent.worker.postMessage({
        type: 'tool_response',
        id,
        result,
      });
    }
  }

  private async handleWorkerError(activeAgent: ActiveAgent, error: Error): Promise<void> {
    logger.error('Agent worker error', { 
      agentId: activeAgent.agentId, 
      error: error.message,
      stack: error.stack 
    });

    activeAgent.status = 'error';
    
    if (activeAgent.currentTask) {
      await this.taskQueueService.failTask(activeAgent.currentTask.id, error.message);
    }

    this.eventBus.publish('agent.error', {
      agentId: activeAgent.agentId,
      error: error.message,
    });
  }

  private handleWorkerExit(activeAgent: ActiveAgent, code: number): void {
    logger.info('Agent worker exited', { 
      agentId: activeAgent.agentId, 
      exitCode: code 
    });

    activeAgent.status = 'idle';
    activeAgent.currentTask = undefined;
    activeAgent.worker = null;
  }

  private startTaskCheckLoop(): void {
    this.taskCheckInterval = setInterval(async () => {
      await this.checkForNewTasks();
      this.checkAgentHeartbeats();
    }, this.CHECK_INTERVAL);

    logger.info('Task check loop started');
  }

  private async checkForNewTasks(): Promise<void> {
    for (const [agentId, activeAgent] of this.activeAgents) {
      if (activeAgent.status === 'idle') {
        try {
          const nextTask = await this.taskQueueService.dequeueNextTask(agentId);
          if (nextTask) {
            // TODO: Buscar configuração do agente do banco
            const mockAgentConfig: AgentConfig = {
              id: agentId,
              name: `Agent ${agentId}`,
              role: 'developer',
              systemPrompt: 'You are a helpful development assistant.',
              llmModel: 'gpt-4',
              capabilities: ['filesystem', 'shell', 'git'],
              maxConcurrentTasks: 1,
            };

            await this.assignTaskToAgent(agentId, nextTask, mockAgentConfig);
          }
        } catch (error: any) {
          logger.error('Failed to assign task to agent', { 
            agentId, 
            error: error.message 
          });
        }
      }
    }
  }

  private checkAgentHeartbeats(): void {
    const now = new Date();
    const HEARTBEAT_TIMEOUT = 60000; // 1 minuto

    for (const [agentId, activeAgent] of this.activeAgents) {
      if (activeAgent.lastHeartbeat && 
          (now.getTime() - activeAgent.lastHeartbeat.getTime()) > HEARTBEAT_TIMEOUT) {
        
        logger.warn('Agent heartbeat timeout', { 
          agentId, 
          lastHeartbeat: activeAgent.lastHeartbeat 
        });

        // Marcar como erro e tentar reiniciar
        activeAgent.status = 'error';
        
        if (activeAgent.worker) {
          activeAgent.worker.terminate();
        }
      }
    }
  }

  private setupEventListeners(): void {
    this.eventBus.subscribe('task.enqueued', async () => {
      // Verificar se há agentes idle e processar imediatamente
      await this.checkForNewTasks();
    });

    logger.info('Agent runtime manager event listeners setup completed');
  }

  getActiveAgents(): ActiveAgent[] {
    return Array.from(this.activeAgents.values());
  }

  getAgentStatus(agentId: string): string | null {
    const activeAgent = this.activeAgents.get(agentId);
    return activeAgent ? activeAgent.status : null;
  }

  getAgentStats(): {
    totalAgents: number;
    activeAgents: number;
    idleAgents: number;
    workingAgents: number;
    errorAgents: number;
  } {
    const agents = Array.from(this.activeAgents.values());
    
    return {
      totalAgents: agents.length,
      activeAgents: agents.length,
      idleAgents: agents.filter(a => a.status === 'idle').length,
      workingAgents: agents.filter(a => a.status === 'working').length,
      errorAgents: agents.filter(a => a.status === 'error').length,
    };
  }
}