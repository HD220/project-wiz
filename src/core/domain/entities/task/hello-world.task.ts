import { BaseTask } from "./base-task";
import { Job } from "@/core/domain/entities/job/job.entity";
import { Result, ok, error } from "@/shared/result"; // Added error
import { ITool } from "@/core/application/tools/tool.interface";
// SearchTool import might be unused if processTools changes, but keep for now
// import { SearchTool } from "@/core/application/tools/search.tool";
import { ILLM } from "@/core/application/llms/llm.interface";
import { TaskExecutionResult } from "@/core/ports/task.interface"; // Import new result type
import { DomainError } from "@/core/common/errors"; // For returning errors

export class HelloWorldTask extends BaseTask {
  constructor(private readonly llm?: ILLM /*, private readonly tools?: ITool[] */) { // Added optional ILLM
    super();
  }

  public async execute(
    currentJob: Job, // Renamed parameter
    tools?: ITool[],
    llm?: ILLM
  ): Promise<Result<TaskExecutionResult>> { // Changed return type
    const jobProps = currentJob.getProps();
    console.log(`Starting HelloWorldTask for Job: ${jobProps.name.getValue()}`);

    let llmMessage = "LLM not called in this task.";
    if (llm) {
      const llmResult = await this.processLLM(llm);
      if (llmResult.isError()) {
        // Optionally, return the error immediately if LLM processing is critical
        // return error(new DomainError(`LLM processing failed in HelloWorldTask: ${llmResult.message}`));
        llmMessage = `LLM processing failed: ${llmResult.message}`;
      } else {
        llmMessage = llmResult.value; // Assuming processLLM now returns Result<string>
      }
    }

    let toolMessage = "No specific tools processed in this task's main flow.";
    if (tools && tools.length > 0) {
      // This task's specific tool logic might be different or simpler
      // For now, let's assume processTools also returns a Result<string> for its output
      const toolProcessingResult = await this.processTools(tools);
      if(toolProcessingResult.isError()){
        toolMessage = `Tool processing failed: ${toolProcessingResult.message}`;
      } else {
        toolMessage = toolProcessingResult.value;
      }
    }

    console.log(`Finished HelloWorldTask for Job: ${jobProps.name.getValue()}`);

    const outputPayload = `HelloWorldTask executed for Job: ${jobProps.name.getValue()}. LLM Status: ${llmMessage}. Tools Status: ${toolMessage}`;

    return ok({
        outputPayload: outputPayload,
        // No specific jobContextModifications or runtimeStateModifications in this example
    });
  }

  // processLLM and processTools should now return Result<string> or similar to signal success/failure/output
  private async processLLM(llm: ILLM): Promise<Result<string>> {
    const llmResult = await llm.generate("Olá, LLM do HelloWorldTask!");
    if (llmResult.isError()) {
        console.error(`LLM failed in HelloWorldTask: ${llmResult.message}`);
        return error(new DomainError(llmResult.message)); // Propagate error
    }
    const output = `LLM executed in HelloWorldTask: ${llmResult.value}`;
    console.log(output);
    return ok(output);
  }

  private async processTools(tools: ITool[]): Promise<Result<string>> {
    const searchTool = tools.find((tool) => tool.name === "SearchTool");
    if (!searchTool) {
      const msg = "SearchTool not found in provided tools for HelloWorldTask.";
      console.log(msg);
      return ok(msg); // Not necessarily an error, maybe task can proceed
    }

    const searchResult = await searchTool.execute("Hello World from HelloWorldTask");
    if (searchResult.isError()) {
        console.error(`SearchTool failed in HelloWorldTask: ${searchResult.message}`);
        return error(new DomainError(searchResult.message)); // Propagate error
    }
    const output = `SearchTool executed in HelloWorldTask: ${searchResult.value}`;
    console.log(output);
    return ok(output);
  }
}
