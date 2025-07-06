export interface LLMGenerationOptions {
  modelId?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
  stopSequences?: string[];
}

export interface LanguageModelMessageToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
}

export interface LanguageModelMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  tool_calls?: LanguageModelMessageToolCall[];
  tool_call_id?: string;
  // name?: string; /
}
