import { tool } from "ai";

export interface LLMResponse {
  answer?: string;
  toolCalls?: Array<{
    name: string;
    args: Record<string, unknown>;
  }>;
}

export interface LLMInterface {
  /**
   * Executa uma chamada à LLM com as Tools fornecidas
   * @param prompt Prompt para a LLM
   * @param tools Lista de Tools disponíveis
   * @returns Resposta da LLM ou undefined se precisar continuar
   */
  executeWithTools(
    prompt: string,
    tools: Array<ReturnType<typeof tool>>
  ): Promise<LLMResponse | undefined>;
}
