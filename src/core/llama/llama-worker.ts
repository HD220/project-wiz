import { MessagePortMain } from "electron";
import {
  TextCompletionMessage,
  ChatCompletionMessage,
  CompletionDoneResponse,
} from "./llama-types";
import {
  getLlama,
  createChatSession,
  createCompletion,
  LlamaModel,
  LlamaContext,
  ChatSession,
} from "node-llama-cpp";

/**
 * Worker para gerenciamento de modelos LLM via MessagePort do Electron.
 * Responsável por:
 * - Inicializar e gerenciar o ciclo de vida do modelo
 * - Processar mensagens de completação de texto e chat
 * - Manter sessões de conversação
 */
export class LlamaWorker {
  private port: MessagePortMain;
  private model?: LlamaModel;
  private context?: LlamaContext;
  private chatSession?: ChatSession;

  /**
   * Cria uma nova instância do LlamaWorker
   * @param port - MessagePortMain para comunicação com o processo principal
   */
  constructor(port: MessagePortMain) {
    this.port = port;
    this.setupMessageHandlers();
  }

  private setupMessageHandlers(): void {
    this.port.on("message", async (event) => {
      try {
        const message = event.data;
        let response: CompletionDoneResponse;

        switch (message.type) {
          case "text_completion":
            response = await this.handleChatCompletionForTextMessage(message);
            break;
          case "chat_completion":
            response = await this.handleChatCompletionMessage(message);
            break;
          default:
            throw new Error(`Unsupported message type: ${message.type}`);
        }

        this.port.postMessage({
          ...response,
          requestId: message.requestId,
        });
      } catch (error) {
        this.port.postMessage({
          type: "error",
          error: error instanceof Error ? error.message : "Unknown error",
          requestId: event.data?.requestId,
        });
      }
    });

    this.port.start();
  }

  /**
   * Processa mensagens de completação de texto simples
   * @param message - Mensagem contendo o prompt para completação
   * @returns Resposta com o texto completado e estatísticas
   * @throws {Error} Se o contexto não estiver inicializado
   * @todo Implementar contagem real de tokens
   * @todo Implementar medição precisa do tempo de avaliação
   * @todo Calcular tokens por segundo corretamente
   */
  private async handleChatCompletionForTextMessage(
    message: TextCompletionMessage
  ): Promise<CompletionDoneResponse> {
    if (!this.context) {
      throw new Error("Context not initialized");
    }

    const result = await createCompletion(this.context, {
      prompt: message.prompt,
    });

    return {
      type: "completion_done",
      fullText: result,
      stats: {
        totalTokens: 0, // TODO: Implementar contagem real
        evaluationTime: 0, // TODO: Implementar medição real
        tokensPerSecond: 0, // TODO: Implementar cálculo real
      },
    };
  }

  /**
   * Processa mensagens de chat com histórico de conversa
   * @param message - Mensagem contendo o histórico da conversa
   * @returns Resposta com o texto completado e estatísticas
   * @throws {Error} Se a sessão de chat não estiver inicializada
   * @todo Implementar contagem real de tokens
   * @todo Implementar medição precisa do tempo de avaliação
   * @todo Calcular tokens por segundo corretamente
   */
  private async handleChatCompletionMessage(
    message: ChatCompletionMessage
  ): Promise<CompletionDoneResponse> {
    if (!this.chatSession) {
      throw new Error("Chat session not initialized");
    }

    const result = await this.chatSession.prompt(message.messages);

    return {
      type: "completion_done",
      fullText: result,
      stats: {
        totalTokens: 0, // TODO: Implementar contagem real
        evaluationTime: 0, // TODO: Implementar medição real
        tokensPerSecond: 0, // TODO: Implementar cálculo real
      },
    };
  }

  /**
   * Inicializa o modelo LLM a partir do caminho especificado
   * @param modelPath - Caminho para o arquivo do modelo GGUF
   * @throws {Error} Se ocorrer falha ao carregar o modelo
   */
  public async initializeModel(modelPath: string): Promise<void> {
    const llama = await getLlama();
    this.model = await llama.loadModel({ modelPath });
    this.context = await this.model.createContext();
    this.chatSession = createChatSession(this.context);
  }

  /**
   * Libera todos os recursos alocados (modelo, contexto, sessão e porta)
   * Deve ser chamado quando o worker não for mais necessário
   */
  public dispose(): void {
    this.chatSession?.dispose();
    this.context?.dispose();
    this.model?.dispose();
    this.port.close();
  }
}
