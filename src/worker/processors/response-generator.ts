import { generateText, type CoreMessage } from "ai";
import { loadProvider } from "../llm/provider-load";
import type { JobFunction, Job } from "../queue/job.types";

export interface ResponseGeneratorJobData {
  agent: {
    name: string;
    role: string;
    backstory: string;
  };
  messages: CoreMessage[];
  provider: string;
  model: string;
  apiKey: string;
}

export const responseGenerator: JobFunction<ResponseGeneratorJobData, string> = async (job: Job<ResponseGeneratorJobData>) => {
  const { agent, messages, provider, model, apiKey } = job.data;
  
  // Mount system prompt
  const systemPrompt = `You are ${agent.name}, ${agent.role}. ${agent.backstory}`;
  
  // Load provider
  const providerInstance = loadProvider(provider, model, apiKey);
  
  // Generate response
  const result = await generateText({
    model: providerInstance,
    system: systemPrompt,
    messages: messages
  });
  
  return result.text;
};