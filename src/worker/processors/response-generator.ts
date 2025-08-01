import { generateText, type CoreMessage, type LanguageModelV1 } from "ai";
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
  console.log("🔥 [ResponseGenerator] Starting job processing:", job.id);
  
  const { agent, messages, provider, model, apiKey } = job.data;
  
  // Mount system prompt
  const systemPrompt = `You are ${agent.name}, ${agent.role}. ${agent.backstory}`;
  console.log("🔥 [ResponseGenerator] System prompt:", systemPrompt);
  console.log("🔥 [ResponseGenerator] Messages:", messages);
  console.log("🔥 [ResponseGenerator] Provider/Model:", provider, model);
  
  // Load provider
  console.log("🔥 [ResponseGenerator] Loading provider...");
  const providerInstance = loadProvider(provider, model, apiKey);
  
  // Generate response
  console.log("🔥 [ResponseGenerator] Calling generateText...");
  
  try {
    const result = await generateText({
      model: providerInstance as LanguageModelV1,
      system: systemPrompt,
      messages: messages
    });
    
    console.log("🔥 [ResponseGenerator] Generated response:", result.text);
    console.log("🔥 [ResponseGenerator] Usage stats:", result.usage);
    console.log("🔥 [ResponseGenerator] Job completed successfully:", job.id);
    
    return result.text;
  } catch (error) {
    console.error("❌ [ResponseGenerator] Error during generateText:", error);
    console.error("❌ [ResponseGenerator] Error details:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      provider,
      model,
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey?.length
    });
    
    // Re-throw the error so the job fails properly
    throw error;
  }
};