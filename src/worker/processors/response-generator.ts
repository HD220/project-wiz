import { generateText, type CoreMessage, type LanguageModel } from "ai";
import { loadProvider } from "../llm/provider-load";
import type { JobFunction, Job } from "../queue/job.types";
import { getLogger } from "@/shared/services/logger/config";

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

const logger = getLogger("worker-response-generator");

export const responseGenerator: JobFunction<ResponseGeneratorJobData, string> = async (job: Job<ResponseGeneratorJobData>) => {
  logger.info("🔥 [ResponseGenerator] Starting job processing:", job.id);
  
  const { agent, messages, provider, model, apiKey } = job.data;
  
  // Mount system prompt
  const systemPrompt = `You are ${agent.name}, ${agent.role}. ${agent.backstory}`;
  logger.debug("🔥 [ResponseGenerator] System prompt:", systemPrompt);
  logger.debug("🔥 [ResponseGenerator] Messages:", messages);
  logger.debug("🔥 [ResponseGenerator] Provider/Model:", provider, model);
  
  // Load provider
  logger.debug("🔥 [ResponseGenerator] Loading provider...");
  const providerInstance = loadProvider(provider, model, apiKey);
  
  // Generate response
  logger.debug("🔥 [ResponseGenerator] Calling generateText...");
  
  try {
    const result = await generateText({
      model: providerInstance as LanguageModel,
      system: systemPrompt,
      messages: messages
    });
    
    logger.debug("🔥 [ResponseGenerator] Generated response:", result.text);
    logger.debug("🔥 [ResponseGenerator] Usage stats:", result.usage);
    logger.info("🔥 [ResponseGenerator] Job completed successfully:", job.id);
    
    return result.text;
  } catch (error) {
    logger.error("❌ [ResponseGenerator] Error during generateText:", error);
    logger.error("❌ [ResponseGenerator] Error details:", {
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