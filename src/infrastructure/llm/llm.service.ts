import { Result, OK, NOK } from "../../shared/result";
import { IpcMainInvokeEvent } from "electron";
import { IpcMessage } from "../ipc/types";
import { AgentId } from "../../core/domain/entities/agent/value-objects/agent-id.vo";
import { AgentRouterHandler, AgentMiddleware } from "../ipc/handlers/agent-router.handler";

export interface LLMResponse {
  content: string;
  metadata: {
    tokensUsed: number;
    processingTimeMs: number;
    model: string;
  };
}

export interface LLMTask {
  prompt: string;
  context?: Record<string, any>;
  options?: {
    temperature?: number;
    maxTokens?: number;
  };
}

export class LLMService {
  private readonly agentStates = new Map<string, LLMAgentState>();
  private readonly router: AgentRouterHandler;

  constructor(router: AgentRouterHandler) {
    this.router = router;
    this.setupMiddlewares();
  }

  private setupMiddlewares(): void {
    this.router.use(this.agentStateMiddleware.bind(this));
    this.router.use(this.taskProcessingMiddleware.bind(this));
  }

  private async agentStateMiddleware(
    event: IpcMainInvokeEvent,
    message: IpcMessage,
    next: () => Promise<Result<any>>
  ): Promise<Result<any>> {
    const agentId = message.meta.source;
    if (!agentId || typeof agentId !== 'string') {
      return NOK(new Error('Valid agent ID is required'));
    }

    // Validação simplificada do AgentId
    try {
      new AgentId(agentId); // Tenta criar instância
    } catch (error) {
      return NOK(error instanceof Error ? error : new Error('Invalid agent ID'));
    }

    // Initialize or update agent state
    if (!this.agentStates.has(agentId)) {
      this.agentStates.set(agentId, {
        id: agentId,
        createdAt: Date.now(),
        lastActivity: Date.now(),
        conversationHistory: [],
        metrics: {
          tasksProcessed: 0,
          totalTokensUsed: 0,
          averageProcessingTimeMs: 0,
        },
      });
    }

    return next();
  }

  private async taskProcessingMiddleware(
    event: IpcMainInvokeEvent,
    message: IpcMessage,
    next: () => Promise<Result<any>>
  ): Promise<Result<any>> {
    if (message.type !== 'llm:task') {
      return next();
    }

    const agentId = message.meta.source;
    // Já validamos que agentId é string no middleware
    const state = this.agentStates.get(agentId as string);
    if (!state) {
      return NOK(new Error(`Agent state not found for ID: ${agentId}`));
    }

    const task = message.payload as LLMTask;
    const startTime = Date.now();

    try {
      // Process task (simulated - integração real virá depois)
      const result = await this.processTask(task, state);
      
      // Update metrics
      const processingTime = Date.now() - startTime;
      state.metrics.tasksProcessed++;
      state.metrics.totalTokensUsed += result.metadata.tokensUsed;
      state.metrics.averageProcessingTimeMs = 
        (state.metrics.averageProcessingTimeMs * (state.metrics.tasksProcessed - 1) + processingTime) / 
        state.metrics.tasksProcessed;

      state.lastActivity = Date.now();
      state.conversationHistory.push({
        task,
        response: result,
        timestamp: Date.now(),
      });

      return OK(result);
    } catch (error) {
      return NOK(error instanceof Error ? error : new Error(String(error)));
    }
  }

  private async processTask(task: LLMTask, state: LLMAgentState): Promise<LLMResponse> {
    // Simulação de processamento - implementação real será adicionada depois
    await new Promise(resolve => setTimeout(resolve, 50)); // Simula latência
    
    return {
      content: `Processed task: ${task.prompt}`,
      metadata: {
        tokensUsed: Math.floor(Math.random() * 100) + 50,
        processingTimeMs: Math.floor(Math.random() * 100) + 50,
        model: 'gpt-4',
      },
    };
  }

  public async executeTask(agentId: string, task: LLMTask): Promise<Result<LLMResponse>> {
    const message: IpcMessage = {
      type: 'llm:task',
      payload: task,
      meta: {
        source: agentId,
        timestamp: Date.now(),
        correlationId: `task-${Date.now()}`,
      },
    };

    return this.router.executeMiddlewares({} as IpcMainInvokeEvent, message);
  }

  public getAgentState(agentId: string): Result<LLMAgentState | undefined> {
    return OK(this.agentStates.get(agentId));
  }

  public getAgentMetrics(agentId?: string): Result<LLMMetrics | Record<string, LLMMetrics>> {
    if (agentId) {
      const state = this.agentStates.get(agentId);
      return state ? OK(state.metrics) : NOK(new Error('Agent not found'));
    }
    
    const allMetrics: Record<string, LLMMetrics> = {};
    this.agentStates.forEach((state, id) => {
      allMetrics[id] = state.metrics;
    });
    return OK(allMetrics);
  }
}

interface LLMAgentState {
  id: string;
  createdAt: number;
  lastActivity: number;
  conversationHistory: Array<{
    task: LLMTask;
    response: LLMResponse;
    timestamp: number;
  }>;
  metrics: LLMMetrics;
}

interface LLMMetrics {
  tasksProcessed: number;
  totalTokensUsed: number;
  averageProcessingTimeMs: number;
}