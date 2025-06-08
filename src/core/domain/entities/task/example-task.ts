import { BaseTask } from "./base-task";
import { Job } from "../job";
import { tool } from "ai";
import { LLMInterface } from "../../../ports/llm.interface";

export class ExampleTask extends BaseTask {
  constructor(llm: LLMInterface) {
    super(llm);
  }

  protected getTools(): Array<ReturnType<typeof tool>> {
    const finalAnswer = {
      name: "finalAnswer",
      description: "Return the final answer to the user",
      execute: undefined,
    } as unknown as ReturnType<typeof tool>;

    return [finalAnswer];
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
    return {
      id: "example-job-1",
      name: "Example LLM Task",
      payload: {
        question: "Explique como funciona o uso de LLM através do ai-sdk",
      },
      data: {},
      max_attempts: 3,
      attempts: 0,
      max_retry_delay: 60000,
      retry_delay: 1000,
      delay: 0,
      priority: 1,
      status: "pending",
    };
  }
}
