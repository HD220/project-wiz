import { LlamaMessageHandler } from "./LlamaMessageHandler";
import { ModelManager } from "./ModelManager";

type GenerationOptions = {
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  stopSequences?: string[];
  streamResponse?: boolean;
};

export class GenerationService {
  private abortController: AbortController | null = null;
  private messageHandler: LlamaMessageHandler;
  private modelManager: ModelManager;

  constructor(messageHandler: LlamaMessageHandler, modelManager: ModelManager) {
    this.messageHandler = messageHandler;
    this.modelManager = modelManager;
  }

  async generateCompletion(prompt: string, options: GenerationOptions) {
    this.abortController = new AbortController();

    try {
      this.messageHandler.sendInfo(
        `Gerando completion para prompt: ${prompt.substring(0, 50)}...`
      );

      const context = await this.modelManager.createContext();

      if (options.streamResponse) {
        let fullText = "";
        await context.completion({
          prompt,
          maxTokens: options.maxTokens,
          temperature: options.temperature,
          topP: options.topP,
          stopSequences: options.stopSequences,
          signal: this.abortController.signal,
          onToken: (token: string) => {
            this.messageHandler.sendCompletionChunk(token);
            fullText += token;
          },
        });
        this.messageHandler.sendCompletionDone(fullText);
      } else {
        const result = await context.completion({
          prompt,
          maxTokens: options.maxTokens,
          temperature: options.temperature,
          topP: options.topP,
          stopSequences: options.stopSequences,
          signal: this.abortController.signal,
        });
        this.messageHandler.sendCompletionDone(result.text);
      }
    } catch (error: any) {
      this.handleGenerationError(error);
    } finally {
      this.abortController = null;
    }
  }

  async generateChatCompletion(messages: any[], options: GenerationOptions) {
    this.abortController = new AbortController();

    try {
      this.messageHandler.sendInfo("Gerando chat completion...");

      const context = await this.modelManager.createContext();

      if (options.streamResponse) {
        let fullText = "";
        await context.chatCompletion({
          messages,
          maxTokens: options.maxTokens,
          temperature: options.temperature,
          topP: options.topP,
          stopSequences: options.stopSequences,
          signal: this.abortController.signal,
          onToken: (token: string) => {
            this.messageHandler.sendCompletionChunk(token);
            fullText += token;
          },
        });
        this.messageHandler.sendCompletionDone(fullText);
      } else {
        const result = await context.chatCompletion({
          messages,
          maxTokens: options.maxTokens,
          temperature: options.temperature,
          topP: options.topP,
          stopSequences: options.stopSequences,
          signal: this.abortController.signal,
        });
        this.messageHandler.sendCompletionDone(result.message.content);
      }
    } catch (error: any) {
      this.handleGenerationError(error);
    } finally {
      this.abortController = null;
    }
  }

  abort() {
    if (this.abortController) {
      this.abortController.abort();
      this.messageHandler.sendInfo("Operação atual abortada");
    } else {
      this.messageHandler.sendInfo(
        "Nenhuma operação em andamento para abortar"
      );
    }
  }

  private handleGenerationError(error: any) {
    if (error.name === "AbortError") {
      this.messageHandler.sendInfo("Geração abortada pelo usuário");
    } else {
      this.messageHandler.sendError("Erro durante a geração", error.message);
    }
  }
}
