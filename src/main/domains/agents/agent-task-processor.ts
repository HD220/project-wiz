import { getLogger } from "../../infrastructure/logger";
import { AgentTask } from "./entities/agent-task.entity";

const logger = getLogger("agent.task.processor");

export class AgentTaskProcessor {
  async process(task: AgentTask): Promise<void> {
    try {
      task.start();
      logger.info("Task started", { taskId: task.getId() });

      await this.performTask(task);

      task.complete();
      logger.info("Task completed", { taskId: task.getId() });
    } catch (error) {
      task.fail();
      logger.error("Task failed", {
        taskId: task.getId(),
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  private async performTask(task: AgentTask): Promise<void> {
    logger.info("Performing task", { taskId: task.getId() });
  }
}