// src/shared/ipc-types/index.ts

// General structure for invoke responses from main process
export type IPCResponse<T = unknown> =
  | { success: true; data: T }
  | {
      success: false;
      error: { message: string; name?: string; stack?: string };
    };

// Specific Request/Response types
export * from "./project.types";
export * from "./persona.types";
export * from "./agent.types";
export * from "./llm.types";
export * from "./user.types";
export * from "./app-settings.types";
export * from "./chat.types";
