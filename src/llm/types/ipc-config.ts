import type {
  LlamaOptions,
  LlamaModelOptions,
  LlamaContextOptions,
  LlamaChatSessionOptions,
  LLamaChatPromptOptions,
} from "node-llama-cpp";
import type { HeartbeatEvent } from "./heartbeat-config";

export type IPCMessage<T = unknown> = {
  id: string;
  channel: string;
  payload?: T;
  error?: string;
};

export type WorkerChannels = {
  "worker:initialize": { options?: LlamaOptions };
  "worker:loadModel": { options: LlamaModelOptions };
  "worker:createContext": { options?: LlamaContextOptions };
  "worker:initializeSession": {
    options?: Omit<LlamaChatSessionOptions, "contextSequence">;
  };
  "worker:processRequest": { prompt: string; options?: LLamaChatPromptOptions };
  "worker:teardown": {};
  "worker:getState": {};
  "worker:setState": { newState: Record<string, unknown> };
  "worker:healthcheck": {};
  "worker:progress": { tokens: any };
  "worker:heartbeat": { timestamp: number };
  "worker:health-status": HeartbeatEvent;
};

export type HandlerFunction<T extends keyof WorkerChannels, R = unknown> = (
  payload: WorkerChannels[T]
) => Promise<R> | R;

export type PendingRequest = {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
  timeout: NodeJS.Timeout;
};
