import { BaseTask } from "./base-task";
import { Job } from "@/core/domain/entities/job/job.entity";
import { Result, ok } from "@/shared/result";
import { ITool } from "@/core/application/tools/tool.interface";
import { SearchTool } from "@/core/application/tools/search.tool";
import { ILLM } from "@/core/application/llms/llm.interface";

export class HelloWorldTask extends BaseTask {
  constructor() {
    super();
  }

  public async execute(
    job: Job,
    tools?: ITool[],
    llm?: ILLM
  ): Promise<Result<void>> {
    if (llm) {
      const llmResult = await llm.generate("Olá, LLM!");
      if (llmResult.isOk()) {
        console.log(`LLM executed: ${llmResult.value}`);
      } else {
        console.error(`LLM failed: ${llmResult.message}`);
      }
    }

    if (tools && tools.length > 0) {
      const searchTool = tools.find((tool) => tool.name === "SearchTool");
      if (searchTool) {
        const searchResult = await searchTool.execute("Hello World");
        if (searchResult.isOk()) {
          console.log(`SearchTool executed: ${searchResult.value}`);
        } else {
          console.error(`SearchTool failed: ${searchResult.message}`);
        }
      }
    }
    console.log(`Executing HelloWorldTask for Job: ${job.name}`);
    return ok(undefined);
  }
}
