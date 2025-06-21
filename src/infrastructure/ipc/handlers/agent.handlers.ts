import { IpcHandler, IpcChannel } from "../types";
import { Result, OK, NOK } from "../../../shared/result";
import { IpcMainInvokeEvent } from "electron";
import { JsonLogger } from "../../services/logger/json-logger.service";
import { ExecuteTaskUseCase } from "../../../core/application/use-cases/agent/execute-task.usecase";

const logger = new JsonLogger("agent-handlers");

interface ListAgentsResult {
  id: string;
  name: string;
  status: string;
}

export const listAgentsHandler: IpcHandler<void, ListAgentsResult[]> =
  Object.assign(
    async (event: IpcMainInvokeEvent) => {
      try {
        logger.info("Listing all agents");
        // TODO: Implementar lógica real de listagem
        return OK([
          { id: "agent-1", name: "Agent 1", status: "idle" },
          { id: "agent-2", name: "Agent 2", status: "working" },
        ]);
      } catch (error) {
        logger.error("Failed to list agents", { error });
        return NOK(error as Error);
      }
    },
    {
      channel: "query:agent:list" as IpcChannel,
      description: "List all available agents",
    }
  );

interface ExecuteTaskParams {
  agentId: string;
}

export const createExecuteTaskHandler = (
  executeTaskUseCase: ExecuteTaskUseCase
): IpcHandler<ExecuteTaskParams, string> => {
  const handler = async (
    event: IpcMainInvokeEvent,
    { agentId }: ExecuteTaskParams
  ) => {
    try {
      logger.info("Executing agent task", { agentId });
      const result = await executeTaskUseCase.execute({
        agentId,
      });
      return result.success
        ? OK(result.data.response)
        : NOK(new Error(result.error.message));
    } catch (error) {
      logger.error("Failed to execute agent task", {
        agentId,
        error,
      });
      return NOK(error as Error);
    }
  };

  return Object.assign(handler, {
    channel: "command:agent:execute" as IpcChannel,
    description: "Execute a task with specified agent",
  });
};

export const AGENT_HANDLERS = [
  listAgentsHandler,
  // executeTaskHandler será adicionado após injeção de dependência
];
