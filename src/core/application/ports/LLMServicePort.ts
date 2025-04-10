import type { Prompt } from './PromptRepositoryPort';

export interface StreamChunk {
  content: string;
  isFinal?: boolean;
}

export interface LLMServicePort {
  loadModel(modelPath: string): Promise<void>;

  prompt(promptText: string): Promise<string>;

  promptStream(
    prompt: Prompt,
    onChunk: (chunk: StreamChunk) => void
  ): Promise<void>;
}