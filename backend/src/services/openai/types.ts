import OpenAI from "openai";

export type BatchProcessResponse = {
  id: string;
  custom_id: string;
  response: {
    status_code: number;
    request_id: string;
    body: {
      id: string;
      object: string;
      created: number;
      model: string;
      choices: {
        index: number;
        message: {
          role: "assistant";
          content: string;
          refusal: any;
        };
        logprobs: any;
        finish_reason: "stop";
      }[];
      usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
        prompt_tokens_details: {
          cached_tokens: number;
          audio_tokens: number;
        };
        completion_tokens_details: {
          reasoning_tokens: number;
          audio_tokens: number;
          accepted_prediction_tokens: number;
          rejected_prediction_tokens: number;
        };
      };
      system_fingerprint: any;
    };
  };
  error: any;
};

export type ChatCompletionResponse = {
  choices: {
    content?: string | null;
    refusal?: string | null;
    role?: "system" | "user" | "assistant" | "tool";
    tool_calls?: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[];
  }[];
  usage: number;
};
