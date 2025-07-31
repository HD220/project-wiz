// Simple HTTP clients for LLM API providers
// Focus on simplicity over performance as per architecture decision

export interface LLMClientConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
}

export interface OpenAIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OpenAIRequest {
  model: string;
  messages: OpenAIMessage[];
  temperature?: number;
  max_tokens?: number;
}

export interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface AnthropicMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AnthropicRequest {
  model: string;
  max_tokens: number;
  messages: AnthropicMessage[];
  temperature?: number;
}

export interface AnthropicResponse {
  id: string;
  type: string;
  role: string;
  content: {
    type: string;
    text: string;
  }[];
  model: string;
  stop_reason: string;
  stop_sequence: null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export class OpenAIClient {
  private config: LLMClientConfig;
  private baseUrl: string;

  constructor(config: LLMClientConfig) {
    this.config = config;
    this.baseUrl = config.baseUrl || "https://api.openai.com/v1";
  }

  async createChatCompletion(request: OpenAIRequest): Promise<OpenAIResponse> {
    const url = `${this.baseUrl}/chat/completions`;
    
    console.log(`🤖 Making OpenAI API call to ${url}`);
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(this.config.timeout || 30000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
    }

    return await response.json() as OpenAIResponse;
  }
}

export class AnthropicClient {
  private config: LLMClientConfig;
  private baseUrl: string;

  constructor(config: LLMClientConfig) {
    this.config = config;
    this.baseUrl = config.baseUrl || "https://api.anthropic.com/v1";
  }

  async createMessage(request: AnthropicRequest): Promise<AnthropicResponse> {
    const url = `${this.baseUrl}/messages`;
    
    console.log(`🤖 Making Anthropic API call to ${url}`);
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "x-api-key": this.config.apiKey,
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(this.config.timeout || 30000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Anthropic API error (${response.status}): ${errorText}`);
    }

    return await response.json() as AnthropicResponse;
  }
}

// Simple factory for creating clients
export class LLMClientFactory {
  static createOpenAI(apiKey: string, baseUrl?: string): OpenAIClient {
    return new OpenAIClient({ apiKey, baseUrl });
  }

  static createAnthropic(apiKey: string, baseUrl?: string): AnthropicClient {
    return new AnthropicClient({ apiKey, baseUrl });
  }

  static createClient(provider: string, apiKey: string, baseUrl?: string): OpenAIClient | AnthropicClient {
    switch (provider.toLowerCase()) {
      case "openai":
      case "gpt":
      case "gpt-4":
      case "gpt-3.5":
        return this.createOpenAI(apiKey, baseUrl);
      case "anthropic":
      case "claude":
        return this.createAnthropic(apiKey, baseUrl);
      default:
        throw new Error(`Unsupported LLM provider: ${provider}`);
    }
  }
}