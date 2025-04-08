import { LlamaModelOptions } from "node-llama-cpp";

export interface WizModelOptions extends LlamaModelOptions {
  modelType: "llama" | "mistral";
  modelId: string;
}
export interface SavePromptOptions {
  prompts: { [key: string]: string };
}

export interface LoadPromptOptions {
  modelId: string;
}
