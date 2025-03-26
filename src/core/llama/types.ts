import type {
  LlamaChatSessionOptions,
  LlamaContextOptions,
  LlamaModelOptions,
  LlamaOptions,
} from "node-llama-cpp";

export type LlamaUtilityMessage =
  | { type: "worker-loaded" }
  | { type: "init-response" }
  | { type: "init"; options?: LlamaOptions }
  | {
      type: "load-model";
      uri: string;
      options?: Omit<LlamaModelOptions, "modelPath">;
    }
  | {
      type: "create-session";
      contextOptions?: LlamaContextOptions;
      sessionOptions?: Omit<LlamaChatSessionOptions, "contextSequence">;
    };
// | { type: "log"; level: string; message: string }
// | { type: "stateChange"; state: string }
// | { type: "textChunk"; text: string }
// | { type: "ready" }
// | { type: "response"; response: string }
// | { type: "error"; error: string }
// | { type: "prompt"; prompt: string };

export type LlamaEventMap = {
  [K in LlamaUtilityMessage["type"]]: [
    data: {
      [P in keyof Extract<LlamaUtilityMessage, { type: K }> as P extends "type"
        ? never
        : P]: Extract<LlamaUtilityMessage, { type: K }>[P];
    }
  ];
};
