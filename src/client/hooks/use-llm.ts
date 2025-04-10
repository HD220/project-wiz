import { useState, useCallback } from 'react';
import type { LlamaModelOptions, LLamaChatPromptOptions, LlamaContextOptions } from 'node-llama-cpp';
import type { Prompt } from '../../core/domain/entities/prompt';
import type { StreamChunk } from '../../core/domain/entities/stream-chunk';
import type { ILlmBridge } from '../../core/domain/ports/llm-bridge.port';

export interface GenerateOptions {
  prompt: string;
  options?: Omit<LLamaChatPromptOptions, 'prompt'>;
}

export interface ModelOptions extends Partial<LlamaModelOptions> {
  modelPath: string;
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

export function useLLM(bridge: ILlmBridge): UseLLMReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [loadedModel, setLoadedModel] = useState<ModelOptions | null>(null);

  const executeOperation = useCallback(async <T>(operation: () => Promise<T>, errorMessage: string): Promise<T> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await operation();
      return result;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(errorMessage);
      setError(errorObj);
      throw errorObj;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadModel = useCallback(async (options: ModelOptions) => {
    return executeOperation(async () => {
      await bridge.loadModel(options.modelPath);
      setLoadedModel(options);
    }, 'Falha ao carregar o modelo');
  }, [bridge, executeOperation]);

  const unloadModel = useCallback(async () => {
    console.warn('unloadModel ainda não suportado na bridge');
    setLoadedModel(null);
  }, []);

  const generate = useCallback(async ({ prompt, options }: GenerateOptions) => {
    return executeOperation(async () => {
      return bridge.prompt(prompt);
    }, 'Falha ao gerar texto');
  }, [bridge, executeOperation]);

  const getLoadedModel = useCallback(async () => {
    return loadedModel;
  }, [loadedModel]);

  const getAvailableModels = useCallback(async () => {
    console.warn('getAvailableModels ainda não suportado na bridge');
    return [];
  }, []);

  const setOptions = useCallback(async (_options: LlamaContextOptions) => {
    console.warn('setOptions ainda não suportado na bridge');
  }, []);

  const generateStream = useCallback((prompt: Prompt, onChunk: (chunk: StreamChunk) => void) => {
    return bridge.promptStream(prompt, onChunk);
  }, [bridge]);

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
