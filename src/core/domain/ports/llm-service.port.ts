import type { Prompt } from '../entities/prompt';
import type { StreamChunk } from '../entities/stream-chunk';

export interface ILlmService {
  loadModel(modelPath: string): Promise<void>;

  prompt(prompt: string): Promise<string>;

  promptStream(
    prompt: Prompt,
    onChunk: (chunk: StreamChunk) => void
  ): Promise<void>;
}
