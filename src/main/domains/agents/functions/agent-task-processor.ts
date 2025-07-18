import { getLogger } from "@/infrastructure/logger";
import { AgentTask } from "../index";

const logger = getLogger("agent.task.processor");

export class AgentTaskProcessor {
  async process(task: AgentTask): Promise<AgentTask> {
    try {
      const startedTask = {
        ...task,
        status: "running" as const,
        updatedAt: new Date(),
      };
      logger.info("Task started", { taskId: task.id });

      await this.performTask(startedTask);

      const completedTask = {
        ...startedTask,
        status: "completed" as const,
        updatedAt: new Date(),
      };
      logger.info("Task completed", { taskId: task.id });
      return completedTask;
    } catch (error) {
      const failedTask = {
        ...task,
        status: "failed" as const,
        updatedAt: new Date(),
      };
      logger.error("Task failed", {
        taskId: task.id,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return failedTask;
    }
  }

  private async performTask(task: AgentTask): Promise<void> {
    logger.info("Performing task", { taskId: task.id });
    // TODO: Implementar lógica real de processamento de tarefas
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}
