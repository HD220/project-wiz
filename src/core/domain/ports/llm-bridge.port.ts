import type { StreamChunk } from '../value-objects/stream-chunk';
import type { Prompt } from '../value-objects/prompt';

export interface BridgeModelLoaderPort {
  loadModel(modelPath: string): Promise<void>;
}

export interface BridgePromptExecutorPort {
  prompt(prompt: string, signal?: AbortSignal): Promise<string>;

  promptStream(
    prompt: Prompt,
    onChunk: (chunk: StreamChunk) => void
  ): { cancel: () => void };
}

export interface ILlmBridge extends BridgeModelLoaderPort, BridgePromptExecutorPort {}