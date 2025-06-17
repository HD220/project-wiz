import { IAgentService } from "../../core/application/ports/agent-service.interface";
import { Job } from "@/core/domain/entities/job/job.entity";
import { Result, error, ok } from "@/shared/result";
import { ITaskFactory } from "@/core/application/factories/task.factory";
import { ITool } from "@/core/application/tools/tool.interface";
import { SearchTool } from "@/core/application/tools/search.tool";
import { ILLM } from "@/core/application/llms/llm.interface";
import { OpenAILLM } from "@/core/application/llms/openai.llm";

export class AgentServiceImpl implements IAgentService {
  constructor(private readonly taskFactory: ITaskFactory) {}

  async executeTask(job: Job): Promise<Result<void>> {
    const taskResult = this.taskFactory.createTask(job);

    if (taskResult.isError()) {
      return error(taskResult.message);
    }

    const taskInstance = taskResult.value;

    // Criar e injetar as ferramentas
    const tools: ITool[] = [new SearchTool()];
    const llm: ILLM = new OpenAILLM("dummy-api-key");

    const executionResult = await taskInstance.execute(job, tools, llm);

    if (executionResult.isError()) {
      return error(executionResult.message);
    }

    return ok(undefined);
  }
}
