import { useState, useCallback } from 'react';
import type { LlamaModelOptions, LLamaChatPromptOptions, LlamaContextOptions } from 'node-llama-cpp';
import type { Prompt } from '../../core/domain/value-objects/prompt';
import type { StreamChunk } from '../../core/domain/value-objects/stream-chunk';
import type { ILlmBridge } from '../../core/domain/ports/llm-bridge.port';
import { retryWithBackoff } from '../lib/utils';

export interface GenerateOptions {
  prompt: string;
  options?: Omit<LLamaChatPromptOptions, 'prompt'>;
  signal?: AbortSignal;
}

export interface ModelOptions extends Partial<LlamaModelOptions> {
  modelPath: string;
}

export interface UseLLMConfig {
  maxRetries?: number;
  initialDelay?: number;
  backoffFactor?: number;
}

export interface UseLLMReturn {
  isLoading: boolean;
  error: Error | null;
  loadModel: (options: ModelOptions) => Promise<void>;
  unloadModel: () => Promise<void>;
  generate: (options: GenerateOptions) => Promise<string>;
  getLoadedModel: () => Promise<ModelOptions | null>;
  getAvailableModels: () => Promise<ModelOptions[]>;
  setOptions: (options: LlamaContextOptions) => Promise<void>;
  generateStream: (
    prompt: Prompt,
    onChunk: (chunk: StreamChunk) => void
  ) => { cancel: () => void };
}

export function useLLM(
  bridge: ILlmBridge,
  config: UseLLMConfig = {}
): UseLLMReturn {
  const {
    maxRetries = 3,
    initialDelay = 500,
    backoffFactor = 2,
  } = config;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [loadedModel, setLoadedModel] = useState<ModelOptions | null>(null);

  const executeOperation = useCallback(
    async <T>(operation: () => Promise<T>, errorMessage: string): Promise<T> => {
      setIsLoading(true);
      setError(null);
      try {
        return await retryWithBackoff(
          operation,
          maxRetries,
          initialDelay,
          backoffFactor
        );
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(errorMessage);
        setError(errorObj);
        throw errorObj;
      } finally {
        setIsLoading(false);
      }
    },
    [maxRetries, initialDelay, backoffFactor]
  );

  const loadModel = useCallback(
    async (options: ModelOptions) => {
      return executeOperation(async () => {
        await bridge.loadModel(options.modelPath);
        setLoadedModel(options);
      }, 'Failed to load model');
    },
    [bridge, executeOperation]
  );

  const unloadModel = useCallback(async () => {
    console.warn('unloadModel is not supported by the bridge yet');
    setLoadedModel(null);
  }, []);

  const generate = useCallback(
    async ({ prompt, options, signal }: GenerateOptions) => {
      return executeOperation(async () => {
        return bridge.prompt(prompt, signal);
      }, 'Failed to generate text');
    },
    [bridge, executeOperation]
  );

  const getLoadedModel = useCallback(async () => {
    return loadedModel;
  }, [loadedModel]);

  const getAvailableModels = useCallback(async () => {
    console.warn('getAvailableModels is not supported by the bridge yet');
    return [];
  }, []);

  const setOptions = useCallback(async (_options: LlamaContextOptions) => {
    console.warn('setOptions is not supported by the bridge yet');
  }, []);

  const generateStream = useCallback(
    (prompt: Prompt, onChunk: (chunk: StreamChunk) => void) => {
      return bridge.promptStream(prompt, onChunk);
    },
    [bridge]
  );

  return {
    isLoading,
    error,
    loadModel,
    unloadModel,
    generate,
    getLoadedModel,
    getAvailableModels,
    setOptions,
    generateStream,
  };
}
