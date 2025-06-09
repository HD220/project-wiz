import { BaseTask } from "./base-task";
import { Job } from "../job/job.entity";
import { LLMInterface } from "../../../ports/llm.interface";
import { Ok } from "@/shared/result";
import { ITool } from "@/core/application/tools/tool.interface";
import { Result, ok } from "@/shared/result";
import { JobId } from "../job/value-objects/job-id.vo";
import { JobStatus } from "../job/value-objects/job-status.vo";
import { JobPriority } from "../job/value-objects/job-priority.vo";
import { JobDependsOn } from "../job/value-objects/job-depends-on.vo";
import { RetryPolicy } from "../job/value-objects/retry-policy.vo";

export class ExampleTask extends BaseTask {
  constructor(private readonly llm: LLMInterface) {
    super();
  }

  protected getTools(): ITool[] {
    // Implementar ferramentas específicas para esta tarefa, se necessário
    return [];
  }

  public async execute(job: Job, tools?: ITool[]): Promise<Result<void>> {
    const prompt = this.getPrompt(job);
    console.log(
      `Executing ExampleTask for Job: ${job.name} with prompt: ${prompt}`
    );
    // Aqui você usaria o LLM e as ferramentas para processar a tarefa
    // Por exemplo:
    // const response = await this.llm.generate(prompt, tools);
    // if (response.isOk()) {
    //   console.log("LLM Response:", response.value);
    // } else {
    //   console.error("LLM Error:", response.message);
    // }
    return ok(undefined);
  }

  protected getPrompt(job: Job): string {
    const payload = job.payload as { question: string };
    return `
      Você é um assistente especializado em responder perguntas técnicas.
      Responda a seguinte pergunta de forma clara e concisa:
      
      Pergunta: ${payload.question}
      
      Sua resposta deve ser no formato markdown.
      Quando tiver a resposta final, use a tool finalAnswer.
    `;
  }

  static createExampleJob(): Job {
    return new Job({
      id: new JobId("example-job-1"),
      name: "Example LLM Task",
      payload: {
        question: "Explique como funciona o uso de LLM através do ai-sdk",
      },
      data: {},
      attempts: 0,
      createdAt: new Date(),
      status: JobStatus.create("PENDING"),
      priority: (JobPriority.create(1) as Ok<JobPriority>).value,
      dependsOn: new JobDependsOn([]),
      retryPolicy: new RetryPolicy({
        maxAttempts: 3,
        delayBetweenAttempts: 1000,
      }),
    });
  }
}
