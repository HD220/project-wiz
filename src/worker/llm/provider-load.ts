import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import { deepseek } from "@ai-sdk/deepseek";

export function loadProvider(provider: string, model: string, apiKey: string) {
  switch (provider.toLowerCase()) {
    case "anthropic":
      return anthropic(model, {
        apiKey: apiKey
      });

    case "openai":
      return openai(model, {
        apiKey: apiKey
      });

    case "gemini":
      return google(model, {
        apiKey: apiKey
      });

    case "deepseek":
      return deepseek(model, {
        apiKey: apiKey
      });

    default:
      throw new Error(`Unsupported provider: ${provider}. Supported providers: anthropic, openai, gemini, deepseek`);
  }
}