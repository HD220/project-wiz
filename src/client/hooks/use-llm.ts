import { useState } from "react";
import {
  loadModel as loadModelApi,
  unloadModel as unloadModelApi,
  generate as generateApi,
  getAvailableModels,
  setOptions as setOptionsApi,
} from "../api";
import { WizModelOptions } from "src/core/services/llm/types";

declare global {
  interface Window {
    llama: {
      loadModel: (options: WizModelOptions) => Promise<void>;
    };
  }
}

/**
 * Opções para a geração de texto.
 */
export type GenerateOptions = {
  temperature?: number;
  maxTokens?: number;
  // ... outros parâmetros
};

/**
 * Opções de configuração do modelo.
 */
export type ModelOptions = {
  // opções de configuração do modelo
};

/**
 * Interface que define o retorno do hook useLLM.
 */
interface UseLLMReturn {
  // Estados
  isLoading: boolean;
  error: Error | null;

  // Métodos
  loadModel(options: WizModelOptions): Promise<void>;
  unloadModel(): Promise<void>;
  generate(prompt: string, options?: GenerateOptions): Promise<string>;
  getLoadedModel(): string | null;
  getAvailableModels(): Promise<string[]>;

  // Configurações
  setOptions(options: ModelOptions): void;
}

/**
 * Hook para interagir com os serviços LLM.
 * @returns {UseLLMReturn} Um objeto contendo estados e métodos para interagir com os serviços LLM.
 */
export const useLLM = (): UseLLMReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [loadedModel, setLoadedModel] = useState<string | null>(null);

  /**
   * Carrega um modelo LLM.
   * @param {string} options
   * @returns {Promise<void>}
   */
  const loadModel = async (options: WizModelOptions): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await window.llama.loadModel(options);
      setLoadedModel(options.modelId);
    } catch (e: any) {
      setError(e);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Descarrega o modelo LLM atual.
   * @returns {Promise<void>}
   */
  const unloadModel = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await unloadModelApi();
      setLoadedModel(null);
    } catch (e: any) {
      setError(e);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Gera texto a partir de um prompt.
   * @param {string} prompt O prompt para gerar o texto.
   * @param {GenerateOptions} options As opções para a geração de texto.
   * @returns {Promise<string>} O texto gerado.
   */
  const generate = async (
    prompt: string,
    options?: GenerateOptions
  ): Promise<string> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await generateApi(prompt, options);
      return response || "";
    } catch (e: any) {
      setError(e);
      return "";
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Retorna o ID do modelo carregado.
   * @returns {string | null} O ID do modelo carregado.
   */
  const getLoadedModel = (): string | null => {
    return loadedModel;
  };

  /**
   * Retorna a lista de modelos disponíveis.
   * @returns {Promise<string[]>} A lista de modelos disponíveis.
   */
  const getAvailableModels = async (): Promise<string[]> => {
    try {
      return await getAvailableModels();
    } catch (e: any) {
      setError(e);
      return [];
    }
  };

  /**
   * Define as opções do modelo.
   * @param {ModelOptions} options As opções do modelo.
   * @returns {Promise<void>}
   */
  const setOptions = async (options: ModelOptions): Promise<void> => {
    try {
      await setOptionsApi(options);
      console.log("Setting options", options);
    } catch (e: any) {
      setError(e);
    }
  };

  return {
    isLoading,
    error,
    loadModel,
    unloadModel,
    generate,
    getLoadedModel,
    getAvailableModels,
    setOptions,
  };
};
