// Worker-specific job types for LLM processing

export interface ProcessMessageJobData {
  userId: string;
  message: string;
  conversationId: string;
  messageId: string;
  llmProvider: {
    id: string;
    name: string;
    config: any;
  };
  conversationHistory?: any[];
}

export interface AnalyzeCodeJobData {
  projectId: string;
  filePath: string;
  code: string;
  analysisType: "security" | "performance" | "style" | "general";
}

export interface GenerateCodeJobData {
  projectId: string;
  requirements: string;
  codeType: "component" | "service" | "util" | "test";
  language: string;
  framework?: string;
}

export interface LLMResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
  provider: string;
}

export interface JobExecutionResult {
  success: boolean;
  data?: any;
  error?: string;
  duration?: number;
}

// Job processor configuration
export interface ProcessorConfig {
  pollInterval: number; // milliseconds
  maxConcurrentJobs: number;
  retryDelay: number; // milliseconds
}