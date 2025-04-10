import type { Prompt } from '../value-objects/prompt';
import type { StreamChunk } from '../value-objects/stream-chunk';

/**
 * Interface consolidada para serviços LLM no domínio.
 * Engloba carregamento, execução síncrona e streaming com cancelamento.
 */
export interface LlmServicePort {
  /**
   * Carrega um modelo LLM a partir do caminho especificado.
   */
  loadModel(modelPath: string): Promise<void>;

  /**
   * Executa um prompt e retorna a resposta completa.
   */
  prompt(prompt: string): Promise<string>;

  /**
   * Executa um prompt com resposta em streaming.
   * Retorna um objeto com método cancel para interromper o fluxo.
   */
  promptStream(
    prompt: Prompt,
    onChunk: (chunk: StreamChunk) => void
  ): { cancel: () => void };
}
