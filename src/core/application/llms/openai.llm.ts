import { Result, ok, error } from "../../../shared/result";
import { ILLM } from "./llm.interface";

export class OpenAILLM implements ILLM {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generate(prompt: string): Promise<Result<string>> {
    // Simula uma chamada à API de um LLM
    if (!this.apiKey) {
      return error("API Key not provided for OpenAILLM.");
    }
    return ok("Resposta do LLM para: " + prompt);
  }
}
