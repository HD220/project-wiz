declare module "node-llama-cpp" {
  interface LlamaModel {
    createContext(): Promise<any>;
    dispose(): void;
  }

  interface LlamaContext {
    dispose(): void;
  }

  interface ChatSession {
    prompt(
      messages: Array<{ role: string; content: string }>,
      options?: {
        onToken?: (chunk: { token: string }) => void;
        signal?: AbortSignal;
      }
    ): Promise<string>;
    dispose(): void;
  }

  interface CompletionOptions {
    prompt: string;
    onToken?: (chunk: { token: string }) => void;
    signal?: AbortSignal;
  }

  export function getLlama(options?: any): Promise<{
    loadModel(options: { modelPath: string }): Promise<LlamaModel>;
    dispose(): void;
  }>;

  export function createChatSession(context: any): ChatSession;

  export function createCompletion(
    context: any,
    options: CompletionOptions
  ): Promise<string>;

  export function downloadModel(options: {
    modelUrl: string;
    signal?: AbortSignal;
  }): Promise<string>;
}
