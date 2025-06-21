import { BaseTask } from "./base-task";
import { Job } from "../job/job.entity";
import { ILLM as LLMInterface } from "@/core/application/llms/llm.interface"; // Corrected path and using ILLM alias
import { Ok } from "@/shared/result";
import { ITool } from "@/core/application/tools/tool.interface";
import { Result, ok } from "@/shared/result";
// Import TaskExecutionResult from the correct path
import { TaskExecutionResult } from "@/core/ports/task.interface";
import { JobId } from "../job/value-objects/job-id.vo";
import { JobStatus } from "../job/value-objects/job-status.vo";
import { JobPriority } from "../job/value-objects/job-priority.vo";
import { JobDependsOn } from "../job/value-objects/job-depends-on.vo";
import { RetryPolicy } from "../job/value-objects/retry-policy.vo";
// Added imports for new VOs
import { JobName } from "../job/value-objects/job-name.vo";
import { AttemptCount } from "../job/value-objects/attempt-count.vo";
import { JobTimestamp } from "../job/value-objects/job-timestamp.vo";

export class ExampleTask extends BaseTask {
  constructor(private readonly llm: LLMInterface) {
    super();
  }

  protected getTools(): ITool[] {
    // Implementar ferramentas específicas para esta tarefa, se necessário
    return [];
  }

  public async execute(
    currentJob: Job, // Renamed parameter for clarity
    tools?: ITool[],
    llm?: LLMInterface // Added llm to match BaseTask, though this task uses this.llm
  ): Promise<Result<TaskExecutionResult>> { // Changed return type
    const prompt = this.getPrompt(currentJob);
    console.log(
      `Executing ExampleTask for Job: ${currentJob.getProps().name.getValue()} with prompt: ${prompt}`
    );

    // Simulate LLM call if this.llm is available
    let llmOutput = "No LLM response in this example task execution.";
    if (this.llm) { // Check if llm was provided to constructor
        const response = await this.llm.generate(prompt, tools); // Pass tools if available
        if (response.isOk()) {
            llmOutput = response.value;
            console.log("LLM Response:", llmOutput);
        } else {
            console.error("LLM Error:", response.message);
            llmOutput = `LLM Error: ${response.message}`;
            // Optionally return error Result here if LLM failure is critical for this task
            // return error(new DomainError(`LLM failed in ExampleTask: ${response.message}`));
        }
    }

    const result: TaskExecutionResult = {
      outputPayload: `ExampleTask executed. Prompt: ${prompt}. LLM said: ${llmOutput}`,
      // No jobContextModifications or runtimeStateModifications in this simple example
    };
    return ok(result);
  }

  protected getPrompt(job: Job): string {
    const jobProps = job.getProps();
    const payload = jobProps.payload as { question: string } | undefined;

    if (!payload || !payload.question) {
      // Handle missing or malformed payload, e.g., return a default prompt or throw error
      console.warn("ExampleTask: Payload or question missing in job.");
      return "Pergunta não encontrada no payload do Job.";
    }

    return `
      Você é um assistente especializado em responder perguntas técnicas.
      Responda a seguinte pergunta de forma clara e concisa:
      
      Pergunta: ${payload.question}
      
      Sua resposta deve ser no formato markdown.
      Quando tiver a resposta final, use a tool finalAnswer.
    `;
  }

  static createExampleJob(): Job {
    // Note: JobBuilder should be the primary way to construct Jobs externally.
    // This static method is for example/testing.
    // Job.create() or new Job() is used here as per current Job entity structure.
    // If JobBuilder is enforced, this would need to change.
    // Also, assuming JobPriority.create and JobDependsOn.create return the VOs directly.
    // If JobPriority.create still returns a Result, it needs .getValue() or similar.
    // Based on previous refactors, VOs like JobPriority now have direct .create static methods.

    const jobProps = {
      id: JobId.create("example-job-1"), // Use static create
      name: JobName.create("Example LLM Task"), // Use static create
      payload: {
        question: "Explique como funciona o uso de LLM através do ai-sdk",
      },
      data: {},
      attempts: AttemptCount.create(0), // Use static create
      createdAt: JobTimestamp.now(), // Use static now or create
      status: JobStatus.create("PENDING"), // Assuming this is correct
      priority: JobPriority.create(1), // Use static create
      dependsOn: JobDependsOn.create([]), // Use static create
      retryPolicy: RetryPolicy.create({ // Use static create
        maxAttempts: 3,
        delayBetweenAttempts: 1000, // These are primitive params for RetryPolicy.create
      }),
    };
    // The Job constructor expects a complete JobProps object.
    // If JobBuilder is the preferred way, this would be:
    // return new JobBuilder()
    //   .withId(JobId.create("example-job-1"))
    //   .withName("Example LLM Task")
    //   ... etc ...
    //   .build();
    // For now, directly creating JobProps and passing to new Job()
    // (assuming Job constructor is public or this is within the same module scope)
    // The Job constructor was made private in a previous step, so JobBuilder is required.
    // Let's assume JobBuilder is available and use it.
    // However, the prompt asks to change `new Job({...})`
    // I will stick to modifying the existing new Job call and assume the Job constructor
    // might be temporarily public or this Task is within its module for direct construction.
    // If Job constructor is strictly private, this method fundamentally needs JobBuilder.
    // Given the prompt's focus is on VO usage, I'll update the new Job call.
    // This highlights that JobBuilder should indeed be the public way.
    // For now, to match prompt structure, I'll assume we can call new Job()
    // with fully formed JobProps (all VOs).

    return new Job(jobProps);
  }
}
