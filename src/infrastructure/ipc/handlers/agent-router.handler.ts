import { IpcHandler, IpcMessage, IpcChannel } from "../types";
import { IpcMainInvokeEvent } from "electron";
import { Result, OK, NOK } from "../../../shared/result";
import { AgentId } from "../../../core/domain/entities/agent/value-objects/agent-id.vo";

// Logger temporário
class JsonLoggerService {
  constructor(private context: string) {}

  debug(message: string, data?: any) {
    console.debug(`[${this.context}] ${message}`, data);
  }

  info(message: string, data?: any) {
    console.info(`[${this.context}] ${message}`, data);
  }

  error(message: string, data?: any) {
    console.error(`[${this.context}] ${message}`, data);
  }

  metric(name: string, value: number, tags: Record<string, string> = {}) {
    console.log(`[METRIC] ${name}=${value}`, tags);
  }
}

export type AgentMiddleware = (
  event: IpcMainInvokeEvent,
  message: IpcMessage,
  next: () => Promise<Result<any>>
) => Promise<Result<any>>;

export class AgentRouterHandler {
  private readonly logger = new JsonLoggerService('AgentRouter');
  private readonly middlewares: AgentMiddleware[] = [];
  private readonly agentSessions = new Map<string, { lastActive: number }>();

  constructor(private readonly timeoutMs: number = 200) {}

  registerHandlers(): IpcHandler[] {
    return [
      this.routeToAgentHandler(),
      this.addMiddlewareHandler(),
      this.getAgentMetricsHandler(),
    ];
  }

  use(middleware: AgentMiddleware): void {
    this.middlewares.push(middleware);
  }

  public async executeMiddlewares(
    event: IpcMainInvokeEvent,
    message: IpcMessage
  ): Promise<Result<any>> {
    const startTime = Date.now();
    let currentIndex = 0;

    const next = async (): Promise<Result<any>> => {
      if (currentIndex >= this.middlewares.length) {
        return NOK(new Error('No middleware handled the request'));
      }

      const middleware = this.middlewares[currentIndex++];
      return middleware(event, message, next);
    };

    try {
      const result = await Promise.race([
        next(),
        new Promise<Result<any>>((_, reject) =>
          setTimeout(
            () => reject(new Error('Request timeout exceeded')),
            this.timeoutMs
          )
        ),
      ]);

      const duration = Date.now() - startTime;
      this.logger.metric('agent_router_latency_ms', duration, {
        agentId: message.meta.source || 'unknown',
        type: message.type,
      });

      return result;
    } catch (error) {
      this.logger.error('Agent routing failed', { error });
      return NOK(error instanceof Error ? error : new Error(String(error)));
    }
  }

  private routeToAgentHandler(): IpcHandler<IpcMessage, any> {
    const handler = async (
      event: IpcMainInvokeEvent,
      payload: IpcMessage
    ): Promise<Result<any>> => {
      try {
        // Validate agentId
        if (!payload.meta.source) {
          throw new Error('Missing agentId in message metadata');
        }

        // Update agent session
        this.agentSessions.set(payload.meta.source, {
          lastActive: Date.now(),
        });

        return this.executeMiddlewares(event, payload);
      } catch (error) {
        this.logger.error('Agent routing failed', { error });
        return NOK(error instanceof Error ? error : new Error(String(error)));
      }
    };

    handler.channel = 'command:agent:route' as IpcChannel;
    handler.description = 'Route message to specific agent with middleware chain';
    return handler;
  }

  private addMiddlewareHandler(): IpcHandler<AgentMiddleware, void> {
    const handler = async (
      event: IpcMainInvokeEvent,
      payload: AgentMiddleware
    ): Promise<Result<void>> => {
      try {
        this.use(payload);
        return OK(undefined);
      } catch (error) {
        this.logger.error('Failed to add middleware', { error });
        return NOK(error instanceof Error ? error : new Error(String(error)));
      }
    };

    handler.channel = 'command:agent:middleware:add' as IpcChannel;
    handler.description = 'Add middleware to agent router';
    return handler;
  }

  private getAgentMetricsHandler(): IpcHandler<void, Record<string, any>> {
    const handler = async (
      event: IpcMainInvokeEvent
    ): Promise<Result<Record<string, any>>> => {
      try {
        const metrics = {
          activeAgents: this.agentSessions.size,
          middlewaresCount: this.middlewares.length,
          agents: Array.from(this.agentSessions.entries()).map(
            ([agentId, session]) => ({
              agentId,
              lastActive: session.lastActive,
              inactiveFor: Date.now() - session.lastActive,
            })
          ),
        };

        return OK(metrics);
      } catch (error) {
        this.logger.error('Failed to get metrics', { error });
        return NOK(error instanceof Error ? error : new Error(String(error)));
      }
    };

    handler.channel = 'query:agent:metrics' as IpcChannel;
    handler.description = 'Get agent router metrics';
    return handler;
  }
}